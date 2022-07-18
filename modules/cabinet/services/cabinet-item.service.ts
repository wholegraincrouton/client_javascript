import { CabinetBasicDetails, CabinetDetail, TempItemDetail, TempSiteDetail } from "src/modules/cabinet/types/dto";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { lookupService } from "src/modules/shared/services/lookup.service";
import { orderBy } from "@progress/kendo-data-query";
import { itemGroupService } from "src/modules/itemGroups/services/itemGroup.service";
import { ItemGroup } from "src/modules/itemGroups/types/dto";

export const cabinetItemService = {
    processSiteCabinetItems
}

function processSiteCabinetItems(customerId: string, selectedCabinetDetails: CabinetDetail[]) {
    var promise = new Promise<TempSiteDetail[]>(resolve => {
        let proccessedCabinetItems: TempSiteDetail[] = [];
        cabinetService.getCabinets(customerId).then((allCabinets) => {
            itemGroupService.getItemGroups(customerId).then((itemGroups) => {
                createSiteDetailsListFromAllCabinets(allCabinets, itemGroups)
                    .then((siteCabinetItemData) => {
                        if (selectedCabinetDetails.length > 0) {
                            //TODO optimize logic by changing the looping on selectedCabinetDetails

                            siteCabinetItemData.forEach(site => {
                                site.cabinets.forEach(cabinet => { // Check selected cabinets
                                    let selectedCabinet = selectedCabinetDetails.find(sc => sc.cabinetId == cabinet.cabinetId);
                                    if (selectedCabinet != undefined) {
                                        cabinet.isSelected = true;
                                        site.isSelected = true;

                                        cabinet.items && cabinet.items.forEach(item => { // Check selected items
                                            let selectedItem = selectedCabinet && selectedCabinet.itemIndexes && selectedCabinet.itemIndexes.find(index => index == item.number);
                                            if (selectedItem) {
                                                item.isSelected = true;
                                            }
                                        });
                                    }

                                });
                            });
                        }
                        else {
                            //Make default site cabinet selection if no selected items
                            siteCabinetItemData[0].isSelected = true;
                            siteCabinetItemData[0].cabinets[0].isSelected = true;
                        }
                        proccessedCabinetItems = siteCabinetItemData;
                        resolve(proccessedCabinetItems);
                    })
                    .catch(() => {
                        proccessedCabinetItems = [];
                        resolve(proccessedCabinetItems);
                    });
            });
        });
    });

    return promise;
}

// Convert basic cabinet details to a ui friendly object list
// Written as a promise since this might take some time
function createSiteDetailsListFromAllCabinets(
    cabinetBasicDetailsList: CabinetBasicDetails[], itemGroups: ItemGroup[]) {
    var promise = new Promise<TempSiteDetail[]>(resolve => {
        let siteItems: TempSiteDetail[] = [];

        siteItems = cabinetBasicDetailsList.reduce((siteList: TempSiteDetail[], cabinet) => {
            let siteId = cabinet.site;
            let site = siteList.find((r) => r && r.siteId === siteId);

            if (site) {
                site.cabinets.push({
                    cabinetId: cabinet.id, cabinetName: cabinet.name,
                    items: getFilteredCabinetItemDetails(cabinet, itemGroups)
                });
            }

            else {
                siteList.push({
                    siteId: siteId, siteName: cabinet.siteName,
                    cabinets: [{
                        cabinetId: cabinet.id, cabinetName: cabinet.name,
                        items: getFilteredCabinetItemDetails(cabinet, itemGroups)
                    }]
                });
            } return siteList;

        }, []);
        let sortedSiteItems = orderBy(siteItems, [{ field: 'siteName', dir: 'asc' }]);
        resolve(sortedSiteItems);
    });

    return promise;
}

function getFilteredCabinetItemDetails(cabinet: CabinetBasicDetails, itemGroups: ItemGroup[]) {
    let filteredItems: TempItemDetail[] = [];
    let items = cabinet.items.filter(i => i.name && i.name != "");

    items.forEach(item => {
        let filteredItem: TempItemDetail = {
            number: item.number,
            siteId: cabinet.site,
            siteName: cabinet.siteName,
            cabinetId: cabinet.id,
            cabinetName: cabinet.name,
            name: item.name,
            type: item.type ? lookupService.getText("LIST_CABINET_ITEM_TYPES", item.type) : ""
        }

        if (item.configurations) {
            let groupNameConfig = item.configurations.find(c => c.key == "ITEM_GROUP_NAME");

            if (groupNameConfig) {
                let itemGroup = itemGroups.find(i => groupNameConfig && i.id == groupNameConfig.value);

                if (itemGroup) {
                    filteredItem.itemGroup = itemGroup.name;
                }
            }
        }
        filteredItems.push(filteredItem);
    });
    return filteredItems;
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/services/cabinet-item.service.ts