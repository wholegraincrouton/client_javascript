import * as React from "react";
import * as moment from "moment";
import { Col, Row } from "reactstrap";
import { DateTimePicker } from "@progress/kendo-dateinputs-react-wrapper"; // DateTimePicker from kendo react is the prefered one but it doesnt work with the common redux forms so use this until there is fix.
import { contextService, configService } from "../../../../shared/services";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../../shared/components/SearchFilterBox";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { AlarmSearchCriteria, AlarmStatus } from "src/modules/eventAlarms/types/dto";
import CabinetList from "src/modules/cabinet/shared/Cabinet/CabinetList";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";

export class AlarmFilterBox extends SearchFilterBox<AlarmSearchCriteria> {
    constructor(props: SearchFilterBoxProps) {
        let startTime = new Date();
        startTime.setMonth(new Date().getMonth() - 6);

        const initialState = {
            // '*' customer is not allowed for alarms.
            contextCustomerId: contextService.getCurrentCustomerId(),
            cabinet: 'any',
            alarm: 'any',
            status: AlarmStatus.Active,
            from: moment(startTime as Date).format(DefaultDateTimeFormats.DateTimeFormat),
            to: moment(new Date()).format(DefaultDateTimeFormats.DateTimeFormat)
        }
        super(props, initialState);
    }

    onDateChange(event: any, name: string) {
        let value = event.sender.value();        

        if (value) {
            let e = {
                target: {
                    name: name,
                    value: moment(value as Date).format(DefaultDateTimeFormats.DateTimeFormat)
                }
            };
    
            this.setState({
                ...this.state,
                [name]: value
            }, () => super.handleChange(e));
        }
    }

    getFields(): JSX.Element {
        const { contextCustomerId, cabinet, alarm, status, from, to } = this.state;

        return <Row className="filter-fields">           
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_CABINET">
                    <CabinetList key={contextCustomerId} name="cabinet" value={cabinet} customerId={contextCustomerId}
                        allowAny={true} textAny="TEXT_ANY_CABINET" onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_ALARM">
                    <LookupDropDown name="alarm" value={alarm} customerId={contextCustomerId} onChange={this.handleChange}
                        lookupKey="LIST_ALARMS" allowAny={true} textAny="TEXT_ANY_ALARM" />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_STATUS">
                    <LookupDropDown name="status" value={status} customerId={contextCustomerId} allowAny={true}
                        textAny="TEXT_ANY_STATUS" lookupKey="LIST_ALARM_STATUS" onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_START_DATETIME">
                    <DateTimePicker name="from" value={new Date(from)} change={(e: any) => this.onDateChange(e, 'from')}
                        format={configService.getKendoDateTimeFormatByCurrentFormat() ||
                            configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                        timeFormat={configService.getKendoTimeFormatByCurrentFormat()}/>
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_END_DATETIME" >
                    <DateTimePicker name="to" value={new Date(to)} change={(e: any) => this.onDateChange(e, 'to')}
                        format={configService.getKendoDateTimeFormatByCurrentFormat() ||
                            configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: AlarmSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0
            && criteria.cabinet.length > 0
            && criteria.alarm.length > 0
            && criteria.status.length > 0
            && criteria.from.length > 0
            && criteria.to.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alarms/AlarmManagement/AlarmFilterBox.tsx