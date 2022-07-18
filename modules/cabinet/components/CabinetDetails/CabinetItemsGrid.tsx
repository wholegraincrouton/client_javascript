import * as React from "react";
import { Row, Col, Input } from 'reactstrap';
import { Grid, GridColumn, GridCellProps, GridSortChangeEvent } from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { localise, lookupService, utilityService } from "../../../shared/services";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { CabinetConfiguration, CabinetItemConfiguration } from '../../../shared/types/dto';
import { CabinetItem, CabinetItemBasicDetails } from "../../types/dto";
import { ItemGroup } from "src/modules/itemGroups/types/dto";
import { itemGroupService } from "src/modules/itemGroups/services/itemGroup.service";
import { siteService } from "src/modules/sites/services/site.service";

interface Props {
    customerId: string;
    items: CabinetItem[];
    site: string;
    onChange: (items: CabinetItem[]) => void;
    cabinetConfigs?: CabinetConfiguration[];
    error?: string;
    isPermittedToEdit?: boolean;
}

interface State {
    items: CabinetItem[];
    inheritedConfigs?: CabinetConfiguration[];
    sort?: SortDescriptor[];
    itemGroups: ItemGroup[];
}

export class CabinetItemsGrid extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSortChange = this.onSortChange.bind(this);
        this.onItemDataChange = this.onItemDataChange.bind(this);
        this.onItemNameChange = this.onItemNameChange.bind(this);
        this.onItemTypeChange = this.onItemTypeChange.bind(this);
        this.onItemConfigChange = this.onItemConfigChange.bind(this);

        this.state = {
            items: [...props.items],
            sort: [{ field: 'number', dir: 'asc' }],
            itemGroups: []
        }
    }

    componentDidMount() {
        const { site, cabinetConfigs, customerId } = this.props;

        if (site) {
            siteService.getSiteConfigurations(site).then((groupConfigs) => {
                let inheritedConfigs = [...cabinetConfigs || []];

                groupConfigs && groupConfigs.forEach(config => {
                    if (cabinetConfigs && !cabinetConfigs.some(c => c.key == config.key))
                        inheritedConfigs.push(config);
                });

                itemGroupService.getItemGroups(customerId).then(data => {
                    this.setState({
                        ...this.state,
                        inheritedConfigs: inheritedConfigs,
                        itemGroups: data
                    });
                });
            });
        }
    }

    //#region Event handlers

    onSortChange(event: GridSortChangeEvent) {
        this.setState({ ...this.state, sort: event.sort });
    }

    onItemDataChange(items: CabinetItem[], clearSort: boolean = false) {
        this.props.onChange(items);

        this.setState({
            ...this.state,
            items: items,
            sort: clearSort ? undefined : this.state.sort
        });
    }

    //#region Grid item events

    onItemNameChange(event: any, number: number) {
        const { items } = this.state;
        let value = event.target.value;
        let item = items.find(i => i.number == number);

        if (item) {
            item.name = value;
            this.onItemDataChange(items, true);
        }
    }

    onItemTypeChange(event: any, number: number) {
        const { items: items } = this.state;
        let value = event.target.value;
        let item = items.find(i => i.number == number);

        if (item) {
            item.type = value;
            this.onItemDataChange(items);
        }
    }

    onItemConfigChange(event: any, number: number, key: string) {
        const { items } = this.state;
        let value = event.target.value;
        let item = items.find(i => i.number == number);

        if (item) {
            let itemConfig = item.configurations && item.configurations.find(i => i.key == key);

            if (itemConfig) {
                if (itemConfig.key == 'ITEM_GROUP_NAME' && value == '-1') {
                    item.configurations && item.configurations.splice(item.configurations.indexOf(itemConfig), 1);
                }
                else {
                    itemConfig.value = value;
                }
            }
            else {
                let index = item.configurations && item.configurations.length;
                let config: CabinetItemConfiguration = {
                    key: key,
                    value: value,
                    index: index == undefined ? -1 : index
                }
                item.configurations && item.configurations.push(config);
            }

            this.onItemDataChange(items);
        }
    }

    //#endregion

    //#endregion

    validateItems(items: CabinetItemBasicDetails[], error: string) {
        items && items.forEach((item: CabinetItemBasicDetails) => {
            let index = items.findIndex(i => i.number != item.number && i.name == item.name);
            let isDuplicate = index != -1;

            if (utilityService.isStringEmpty(item.name) && error == "ERROR_ITEMS_REQUIRED_FIELDS")
                item.requiredError = localise('TEXT_REQUIRED_FIELD');
            else if (isDuplicate && error == "ERROR_DUPLICATE_ITEMS")
                item.duplicateError = localise('ERROR_DUPLICATE_RECORDS');
        });

        return items;
    }

    getItemsToDisplay(items: CabinetItem[]) {
        let cabinetItemDetails: CabinetItemBasicDetails[] = [];

        items.forEach((item) => {
            let itemExpirary = this.getConfigValue('ITEM_EXPIRY_TIME', item.configurations);
            let multiCustodyWitnessCount = this.getConfigValue('MULTI_CUSTODY', item.configurations);
            let returnWithoutWitness = this.getConfigValue('RETURN_WITHOUT_WITNESS', item.configurations);
            let itemGroup = this.getConfigValue('ITEM_GROUP_NAME', item.configurations);
            let serialNumber = this.getConfigValue('KEYRING_SERIAL_NUMBER', item.configurations);

            let itemBasicDetails: CabinetItemBasicDetails = {
                number: item.number,
                name: item.name,
                itemGroup: itemGroup,
                type: item.type,
                itemExpirary: itemExpirary,
                multicustodyWitnessCount: multiCustodyWitnessCount,
                returnWithoutWitness: returnWithoutWitness,
                serialNumber: serialNumber
            };

            cabinetItemDetails.push(itemBasicDetails);
        });

        return cabinetItemDetails;
    }

    getConfigValue(key: string, itemConfigs?: CabinetItemConfiguration[]) {
        const { cabinetConfigs } = this.props;
        const { inheritedConfigs } = this.state;
        let itemConfig = itemConfigs && itemConfigs.find(c => c.key == key);

        if (itemConfig == undefined) {
            //Check in cabinet level
            let cabinetConfig = cabinetConfigs && cabinetConfigs.find((cabConfig => cabConfig.key == key));

            //Check in cabinet group level
            if (!cabinetConfig) {
                let cabinetGroupConfig = inheritedConfigs && inheritedConfigs.find((cabGroupConfig => cabGroupConfig.key == key));
                return cabinetGroupConfig && cabinetGroupConfig.value;
            }
            return cabinetConfig && cabinetConfig.value;
        }
        return itemConfig && itemConfig.value;
    }

    render() {
        const { error, isPermittedToEdit } = this.props;
        const { items, sort, itemGroups } = this.state;
        let cabinetItems = this.getItemsToDisplay(items);
        cabinetItems = sort && cabinetItems ? orderBy(cabinetItems, sort) : cabinetItems;

        if (error)
            cabinetItems = this.validateItems(cabinetItems, error);

        return (
            <Row>
                <Col>
                    <div className="cabinets-items">
                        <Grid className={isPermittedToEdit ? "cabinet-items-grid" : "cabinet-items-disabled-grid"} data={cabinetItems} sort={sort}
                            onSortChange={this.onSortChange} sortable={{ allowUnsort: false, mode: 'single' }}
                            selectedField="rowSelected">
                            <GridColumn width="70px" field="number" title={localise("TEXT_ITEM_NUMBER")} />
                            <GridColumn field="name" title={localise("TEXT_NAME")} cell={this.GetCabinetItemNameConst}
                                sortable={false} />
                            <GridColumn field="type" title={localise("TEXT_ITEM_TYPE")}
                                cell={GetItemTypeCell(this.onItemTypeChange, 'LIST_CABINET_ITEM_TYPES')} />
                            <GridColumn field="itemExpirary"
                                title={lookupService.getText('LIST_CABINET_ITEM_CONFIGURATION_KEYS', 'ITEM_EXPIRY_TIME')}
                                cell={GetItemConfigCell('itemExpirary', 'ITEM_EXPIRY_TIME',
                                    this.onItemConfigChange, 'LIST_ITEM_EXPIRY_TIMES')} />
                            <GridColumn field="multicustodyWitnessCount"
                                title={lookupService.getText('LIST_CABINET_ITEM_CONFIGURATION_KEYS', 'MULTI_CUSTODY')}
                                cell={GetItemConfigCell('multicustodyWitnessCount', 'MULTI_CUSTODY',
                                    this.onItemConfigChange, 'LIST_MULTICUSTODY_WITNESS_COUNT')} />
                            <GridColumn field="returnWithoutWitness"
                                title={lookupService.getText('LIST_CABINET_ITEM_CONFIGURATION_KEYS', 'RETURN_WITHOUT_WITNESS')}
                                cell={GetItemConfigCell('returnWithoutWitness', 'RETURN_WITHOUT_WITNESS',
                                    this.onItemConfigChange, 'LIST_BOOLEAN_FLAGS')} />
                            <GridColumn field="itemGroup" title={localise("TEXT_ITEM_GROUP")}
                                cell={GetItemGroupCell(this.onItemConfigChange, itemGroups || [], 'ITEM_GROUP_NAME')} />
                            <GridColumn field="serialNumber"
                                title={lookupService.getText('LIST_CABINET_ITEM_CONFIGURATION_KEYS', 'KEYRING_SERIAL_NUMBER')}
                                cell={this.GetItemSerialNumberConst} sortable={false} />
                        </Grid>
                    </div>
                </Col>
            </Row>
        );
    }

    GetCabinetItemNameConst = (props: any) => <GetCabinetItemNameCell {...props} onNameChange={this.onItemNameChange} />;
    GetItemSerialNumberConst = (props: any) => <GetSerialNumberTextCell {...props} onChange={this.onItemConfigChange} />;
}

//#region Cells

class GetCabinetItemNameCell extends React.Component<any> {
    render() {
        const { dataItem } = this.props;
        const itemName = dataItem["name"];
        const itemNumber = dataItem['number'];
        const requiredError = dataItem['requiredError'];
        const duplicateError = dataItem['duplicateError'];

        return (
            <td>
                <Input type="text" key="name" value={itemName} name="itemName"
                    onChange={(e: any) => this.props.onNameChange(e, itemNumber)} >
                </Input>
                {
                    (requiredError || duplicateError) &&
                    <div style={{ height: '15px' }}>
                        <small className="text-danger">{requiredError || duplicateError}</small>
                    </div>
                }
            </td>
        )
    }
}

function GetItemTypeCell(onTypeChange: any, key: string) {
    return class extends React.Component<GridCellProps> {
        render() {
            const { dataItem } = this.props;
            const itemType = dataItem['type'];
            const itemNumber = dataItem['number'];
            const hasError = dataItem['requiredError'] || dataItem['duplicateError'];

            return (
                <td>
                    <LookupDropDown lookupKey={key} value={itemType}
                        onChange={(e: any) => onTypeChange(e, itemNumber, itemType)} />
                    {hasError && <div id='errorDiv' style={{ height: '10px' }} />}
                </td>
            )
        }
    };
}

function GetItemConfigCell(dataKey: string, configKey: string, onConfigChange: any, lookupKey: string) {
    return class extends React.Component<GridCellProps> {
        render() {
            const { dataItem } = this.props;
            const selectedValue = dataItem[dataKey];
            const itemNumber = dataItem['number'];
            const hasError = dataItem['requiredError'] || dataItem['duplicateError'];

            return (
                <td>
                    <LookupDropDown lookupKey={lookupKey} value={selectedValue}
                        onChange={(e: any) => onConfigChange(e, itemNumber, configKey)} />
                    {hasError && <div id='errorDiv' style={{ height: '10px' }} />}
                </td>
            )
        }
    };
}

const GetItemGroupCell = (onConfigChange: any, itemGroups: ItemGroup[], configKey: string) => {
    return class extends React.Component<GridCellProps> {
        render() {
            const { dataItem } = this.props;
            const itemGroup = dataItem["itemGroup"];
            const itemNumber = dataItem['number'];
            const hasError = dataItem['requiredError'] || dataItem['duplicateError'];
            let sortedItemGroups = orderBy(itemGroups, [{ dir: 'asc', field: 'itemGroupName' }])

            return (
                <td>
                    <Input type="select" value={itemGroup} name="itemGroup"
                        onChange={(e: any) => onConfigChange(e, itemNumber, configKey)} >
                        <option value="-1" key="-1">{localise('TEXT_PART_OF_NO_GROUP')}</option>
                        {sortedItemGroups.map((g, key) => <option value={g.id} key={key}>{g.name}</option>)}
                    </Input>
                    {hasError && <div id='errorDiv' style={{ height: '10px' }} />}
                </td>
            )
        }
    };
}

const GetSerialNumberTextCell = (props: any) => {
    const number = props.dataItem["number"] as number;
    const serialNumber = props.dataItem["serialNumber"] as string;
    const hasError = props.dataItem['requiredError'] || props.dataItem['duplicateError'];

    return (
        <td>
            <Input value={serialNumber} onChange={(e: any) => props.onChange(e, number, "KEYRING_SERIAL_NUMBER")} />
            {hasError && <div id='errorDiv' style={{ height: '10px' }} />}
        </td>
    );
}

//#endregion



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetDetails/CabinetItemsGrid.tsx