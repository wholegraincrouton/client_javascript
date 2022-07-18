import FormGroup from "reactstrap/lib/FormGroup";
import * as React from "react";
import { localise, accountSessionService, configService, contextService } from "../../services";
import * as moment from 'moment';
import { localiseWithParams } from "src/modules/shared/services/localisation.service";

interface AuditFieldProps {
    updatedOnUtc?: Date;
    updatedByName?: string;
}

const FormAuditField = (props: AuditFieldProps) => {
    return (
        !props.updatedOnUtc ? null
            :
            <FormGroup>
                <label> {localise("TEXT_AUDIT")} </label><br />
                {props.updatedOnUtc && <small className="text-muted">{getAuditText(props.updatedByName, props.updatedOnUtc)} </small>}
            </FormGroup>)
}

function getAuditText(person?: string, date?: Date) {
    var displayDate = moment.utc(date).add(accountSessionService.getLoggedInUserTimeZoneOffsetInMinutues(), 'm');
    const dateStr = (displayDate.format(contextService.getCurrentDateTimeFormat() || configService.getDateTimeFormatConfigurationValue().momentDateTimeFormat));
    const auditText = localiseWithParams('TEXT_AUDIT_MESSAGE', { "by": person, "on": dateStr });
    return auditText;
}

export default FormAuditField


// WEBPACK FOOTER //
// ./src/modules/shared/components/Form/FormAuditField.tsx