import * as React from 'react';
import * as moment from 'moment';
import { Input, Label, Row, Col } from 'reactstrap';
import { DateTimePicker } from "@progress/kendo-dateinputs-react-wrapper"; // DateTimePicker from kendo react is the prefered one but it doesnt work with the common redux forms so use this until there is fix.
import { DefaultDateTimeFormats } from 'src/modules/shared/constants/datetime.constants';
import { FormField, FormAuditField } from '../../../shared/components/Form';
import { DetailPage, DetailFormBodyComponent, DetailPageContainer } from '../../../shared/components/DetailPage';
import { Firmware } from '../../types/dto';
import { LookupDropDown } from 'src/modules/shared/components/LookupDropDown/LookupDropDown';
import { configService, contextService, localise } from 'src/modules/shared/services';
import { Upload } from '@progress/kendo-upload-react-wrapper';
import { firmwareService } from '../../services/firmware.service';
import { SubmissionError } from 'redux-form';
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { permissionService } from 'src/modules/shared/services/permission.service';

class FirmwareDetails extends DetailPage<Firmware> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/configuration/firmwaremanagement";
    readonly: boolean;

    componentWillUnmount() {
        firmwareService.clearUploadFile();
    }

    validateItem(): any {
        return {};
    }

    formValuesToObject(values: any) {
        return {
            ...values,
            releaseTimeLocal: moment(values.releaseTimeLocal as Date).format(DefaultDateTimeFormats.DateTimeFormat)
        };
    }

    beforeSave(item: Firmware, isNew: boolean): boolean {
        let error = this.validate(item, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }

        return true;
    }

    afterSave(id: string, item: Firmware, isNew: boolean) {
        if (isNew) {
            firmwareService.uploadFile(item.version, item.fileName, item.fileSize)
                .then(() => {
                    firmwareService.clearUploadFile();
                    firmwareService.clearFirmwareList();
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    afterDelete(id: string, item?: Firmware) {
        item && firmwareService.deleteFile(item.version, item.fileName)
            .catch(error => {
                console.log(error);
            });
        return true;
    }

    validate(item: Firmware, isNew: boolean) {
        if (isNew && (!item.fileName || !item.fileSize))
            return "ERROR_FILE_REQUIRED";

        return null;
    }
}

const FormBody = (formProps: any) => {
    function localTimeRequiredFieldValidator(localTime: any) {
        return !localTime ? localise("ERROR_FIELD_REQUIRED") : undefined;
    }

    function onDateChange(event: any, p: any) {
        let e = {
            target: {
                value: event.sender.value(),
                name: p.name
            }
        }
        p.onChange(e);
    }

    const uploadControllerLocalisation: kendo.ui.UploadLocalization = {
        select: localise("TEXT_BROWSE"),
        invalidFileExtension: localise("ERROR_INVALID_FILE_TYPE"),
        uploadSelectedFiles: localise("TEXT_CONFIRM_AND_UPLOAD"),
        clearSelectedFiles: localise("TEXT_CLEAR"),
        invalidMaxFileSize: localise("ERROR_MAXIMUM_FILE_SIZE_EXCEEDED")
    }

    function onFileAdd(e: any) {
        let fileName = e.files[0].name as string;

        if (fileName.endsWith(".swu")) {
            formProps.change("fileName", fileName);
            formProps.change("fileSize", Math.round(((e.files[0].size / 1024 / 1024) + Number.EPSILON) * 100) / 100);
            firmwareService.setUploadFile(e.files[0].rawFile);
        }
    }

    function onFileRemove() {
        formProps.change("fileName", undefined);
        formProps.change("fileSize", undefined);
    }

    function isReadOnly() {
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(!formProps.isNew ? 'UPDATE' : 'NEW');
        return !isPermittedToEdit;
    }
    return <>
        <FormField name="version" labelKey="TEXT_FIRMWARE_VERSION" remarksKey="REMARK_FIRMWARE_VERSION"
            component={GetVersionInput} disabled={!formProps.isNew || isReadOnly()} required={true} />
        <Row className="form-group w-50">
            <Col>
                <div><Label>{localise("TEXT_FILE")} *</Label></div>
                <div>
                    {
                        formProps.isNew ?
                            <div>
                                <Upload multiple={false} localization={uploadControllerLocalisation}
                                    validation={{ allowedExtensions: [".swu"] }}
                                    select={onFileAdd} remove={onFileRemove} />
                            </div>
                            :
                            <Label style={{ color: "#495057" }}>
                                {formProps.item.fileName} ({formProps.item.fileSize}MB)
                            </Label>
                    }
                </div>
                <div>
                    <small className={formProps.error == "ERROR_FILE_REQUIRED" ? "text-danger" : "text-muted"}>
                        {localise(formProps.error == "ERROR_FILE_REQUIRED" ? "ERROR_FIELD_REQUIRED" : "REMARK_FIRMWARE_FILE")}
                    </small>
                </div>
            </Col>
        </Row>
        <FormField name="releaseTimeLocal" labelKey="TEXT_RELEASE_DATETIME" remarksKey="REMARK_FIRMWARE_RELEASE_DATETIME"
            required={true} validate={localTimeRequiredFieldValidator} disableInbuiltValidator={true}
            component={(p: any) =>
                <div>
                    {
                        !formProps.isNew || isReadOnly() ?
                            <Label style={{ color: "#495057" }}>
                                {moment(p.value).format(contextService.getCurrentDateTimeFormat() || configService.getDateTimeFormatConfigurationValue().momentDateTimeFormat)}
                            </Label>
                            :
                            <DateTimePicker {...p} change={(e: any) => onDateChange(e, p)}
                                format={configService.getKendoDateTimeFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                                timeFormat={configService.getKendoTimeFormatByCurrentFormat()}
                                value={p.value ? new Date(p.value) : undefined} min={new Date()} />
                    }
                </div>
            } />
        <FormField name="timeZone" labelKey="TEXT_TIMEZONE" remarksKey="REMARK_FIRMWARE_TIMEZONE" disabled={!formProps.isNew || isReadOnly()}
            required={true} component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_TIMEZONE" />} />
        <FormField name="remark" labelKey="TEXT_REMARK" remarksKey="REMARK_FIRMWARE_REMARK" component={Input} disabled={isReadOnly()}/>
        <FormAuditField updatedOnUtc={formProps.item.updatedOnUtc} updatedByName={formProps.item.updatedByName} />
    </>
}

const GetVersionInput = (props: any) => <Input maxLength={100} value={props.value}
    disabled={props.disabled} onChange={(e: any) => props.onChange(e)} />

export default DetailPageContainer(FirmwareDetails, "FirmwareDetails", "firmware", undefined, apiConstants.DEVICES);


// WEBPACK FOOTER //
// ./src/modules/firmware/components/FirmwareDetails/FirmwareDetails.tsx