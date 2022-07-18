import * as React from "react";
import * as moment from 'moment';
import { Label, Input, Row, Col } from "reactstrap";
import { DateTimePicker } from "@progress/kendo-dateinputs-react-wrapper"; // DateTimePicker from kendo react is the prefered one but it doesnt work with the common redux forms so use this until there is fix.
import { configService, lookupService, localise, contextService } from "src/modules/shared/services";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { permissionService } from '../../../../shared/services/permission.service';

export class DeviceUpdateDetailsTab extends React.Component<DetailFormProps> {
    onDateChange(event: any, p: any) {
        let e = {
            target: {
                value: event.sender.value(),
                name: p.name
            }
        }
        p.onChange(e);
    }

    render() {
        const { props } = this;
        const { item } = this.props;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <>
                {
                    !props.readonly &&
                    <Row className="mb-3">
                        <Col>
                            <small className="text-muted"> {localise("TEXT_PAGE_DESCRIPTION")} </small>
                        </Col>
                        <Col md="auto">
                            <small className="text-muted"> {localise('TEXT_REQUIRED_FIELD')} </small>
                        </Col>
                    </Row>
                }
                {
                    props.readonly &&
                    <FormField labelKey="TEXT_STATUS" name="status" component={() =>
                        <div style={{ color: "#495057" }}>{lookupService.getText("LIST_DEVICEUPDATE_STATUS", props.item.status)}</div>}
                        disabled={!isPermittedToEdit}
                    />
                }              
                <FormField remarksKey="REMARK_DEVICEUPDATE_UPDATELABEL" required={!props.readonly} labelKey="TEXT_UPDATELABEL"
                    name="updateLabel" component={Input} disabled={props.readonly || !isPermittedToEdit} />
                <FormField remarksKey="REMARK_DEVICEUPDATE_REMARK" required={!props.readonly} labelKey="TEXT_REMARK"
                    name="remark" component={Input} disabled={props.readonly || !isPermittedToEdit} />
                <FormField remarksKey="REMARK_DEVICEUPDATE_LOCALTIME" required={!props.readonly} labelKey="TEXT_LOCALTIME" name="localTime"
                    validate={localTimeRequiredFieldValidator} disableInbuiltValidator={true}
                    component={(p: any) =>
                        <div>
                            {
                                props.readonly || !isPermittedToEdit ?
                                    <Label style={{ color: "#495057" }}>
                                        {moment(p.value).format(contextService.getCurrentDateTimeFormat())}
                                    </Label>
                                    :
                                    <DateTimePicker {...p} change={(e: any) => this.onDateChange(e, p)}
                                        format={configService.getKendoDateTimeFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                                        timeFormat={configService.getKendoTimeFormatByCurrentFormat()}
                                        value={p.value ? new Date(p.value) : undefined} />
                            }
                        </div>
                    } />
                <FormAuditField updatedOnUtc={props.item.updatedOnUtc} updatedByName={props.item.updatedByName} />
            </>
        );
    }
}

export const localTimeRequiredFieldValidator = (localTime: Date) => {
    return (localTime == undefined) ? localise("ERROR_FIELD_REQUIRED") : undefined;
}



// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateDetails/Tabs/DeviceUpdateDetailsTab.tsx