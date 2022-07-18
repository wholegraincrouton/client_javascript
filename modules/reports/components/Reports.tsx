import * as React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { lookupService, permissionService, customerService } from 'src/modules/shared/services';
import * as qs from "query-string";
import { History } from 'history';
import "./reports.css";
import * as moment from 'moment';
import { DefaultDateTimeFormats } from 'src/modules/shared/constants/datetime.constants';

interface props {
    history: History;
}

export class Reports extends React.Component<props> {

    constructor(props: any) {
        super(props);
        this.navigateToReportAndSearch = this.navigateToReportAndSearch.bind(this);
        this.getMasterListLookup = this.getMasterListLookup.bind(this);
        this.isPermittedToView = this.isPermittedToView.bind(this);
        this.getTime = this.getTime.bind(this);
    }

    getMasterListLookup() {
        let lookupList = lookupService.getList("LIST_MASTER_REPORTS");
        return lookupList;
    }

    isPermittedToView(lookupItemValue: string) {
        return permissionService.checkIfPermissionExists(lookupItemValue + '_VIEW');
    }

    getTime(isEndTime?: boolean) {
        let time = new Date();

        if (isEndTime) {
            return time.toISOString();
        }
        else {
            time.setHours(time.getHours() - 24);
            return time.toISOString();
        }
    }

    navigateToReportAndSearch(parentLookupValue: string, childLookupItemValue: string) {
        let permission = parentLookupValue + '_VIEW';
        let permittedFirstCustomerId = customerService.getFirstCustomerId(permission);
        let searchQuery = {};
        if (childLookupItemValue == "cabinet_item_status_report") {
            searchQuery = { includeDeleted: false, cabinetName: '', cabinetGroupName: '', itemName: '', itemStatus: 'any', user: '' };
        }
        else if (childLookupItemValue == "cabinet_history_report") {
            searchQuery = {
                includeDeleted: false, cabinetName: '', cabinetGroupName: '', country: '', state: '', eventType: 'any', itemName: '',
                from: this.getTime(), to: this.getTime(true),
                callPath: '/reports/overview'
            }
        }
        else if (childLookupItemValue == "user_access_report") {
            let startDateString = moment(new Date).add(-1, 'days').format(DefaultDateTimeFormats.DateTimeFormat);
            let endDateString = moment(new Date).format(DefaultDateTimeFormats.DateTimeFormat);

            searchQuery = {
                cabinetId: 'any', itemNo: -1, accessGroupId: 'any', actionByUserId: 'any',
                accessBasis: 'any', userId: 'any',
                fromDate: startDateString, toDate: endDateString
            }
        }
        else if (childLookupItemValue == "user_audit_report") {
            let endTime = new Date();
            let startTime = new Date();
            startTime.setHours(startTime.getHours() - 24);
            let startDateString = moment(startTime).format(DefaultDateTimeFormats.DateTimeFormat);
            let endDateString = moment(endTime).format(DefaultDateTimeFormats.DateTimeFormat);
            permittedFirstCustomerId = customerService.getFirstCustomerId(permission, true);

            searchQuery = {
                actionByUserId: 'any', actionType: 'any',
                name: '', mobileNumber: '', email: '', userId: '',
                from: startDateString, to: endDateString
            }
        }
        else if (childLookupItemValue == "customer_details_report") {
            searchQuery = {
                customerName: '', salesForceCustomerId: '', firstName: '', lastName: '',
                mobileNumber: '', country: 'any', state: 'any', accountCreatedByUserId: 'any',
                anniversaryDate: 'any', accountStatus: 'any'
            }
        }
        else if (childLookupItemValue == "customer_cabinet_report") {
            searchQuery = {
                customerName: '', cabinetName: '', cabinetSerialNo: '', provisioningKey: '', cabinetSize: 0, site: '', firmwareVersion: 'any'
            }
        }
        else if (childLookupItemValue == "customer_resource_report") {
            searchQuery = { year: 'any', month: 'any' }
        }
        else if (childLookupItemValue == "item_record_report") {
            let endTime = new Date();
            let startTime = new Date();
            startTime.setHours(startTime.getHours() - 24);
            let startDateString = moment(startTime).format(DefaultDateTimeFormats.DateTimeFormat);
            let endDateString = moment(endTime).format(DefaultDateTimeFormats.DateTimeFormat);

            searchQuery = {
                site: 'any',
                cabinetId: 'any',
                itemNo: -1,
                itemName: "any",
                otherDetails: '',
                actionBy: 'any',
                fromDate: startDateString,
                toDate: endDateString
            }
        }
        else if(childLookupItemValue == "user_accessible_items"){
            searchQuery = {
                site: 'any',
                cabinetId: 'any',
                itemNo: -1,
                itemName: "any",
                accessGroupId: 'any',
                userId: 'any',
                lastUpdatedUserId: 'any'
            }
        }
        else {
            searchQuery = {
                includeDeleted: false, cabinetName: '', cabinetGroupName: '', country: '', state: '', eventType: 'any', itemName: '',
                from: this.getTime(), to: this.getTime(true)
            };
        }

        this.props.history.push({
            pathname: `/reports/overview/${childLookupItemValue}`,
            search: qs.stringify(Object.assign({ contextCustomerId: permittedFirstCustomerId }, searchQuery))
        });
    }

    getReportsInsideSection(parentLookupValue: string, childLookupKey: string) {
        let lookupList = lookupService.getList(childLookupKey);
        return (
            lookupList.map((lookupItem) => {
                let lookupItemValue = (lookupItem.value && lookupItem.value.toLowerCase()) || "";
                return (
                    <li key={lookupItemValue} className="clickable color-blue" onClick={e => this.navigateToReportAndSearch(parentLookupValue, lookupItemValue)} > <a>{lookupItem.text}</a> </li>
                );
            })
        );
    }

    render() {
        const lookupList = this.getMasterListLookup();

        return (
            <div className="reports-main mt-2">
                {
                    lookupList.map((lookupItem) => {
                        return (lookupItem.value && this.isPermittedToView(lookupItem.value) &&
                            <Card key={lookupItem.value} className="page-fixed-content compact">
                                <CardBody>
                                    <Row>
                                        <Col>
                                            <h4>{lookupItem.text}</h4>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <ul>
                                            {lookupItem.childLookupKey && this.getReportsInsideSection(lookupItem.value, lookupItem.childLookupKey)}
                                        </ul>
                                    </Row>
                                </CardBody>
                            </Card>)
                    })
                }
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/Reports.tsx