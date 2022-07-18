import * as React from "react";
import { Field, Validator } from "redux-form";
import FormFieldContent from "./FormFieldContent";
import { localise } from "../../services";

interface FormFieldProps {
    name: string;
    labelKey?: string;
    remarksKey?: string;
    component: any;
    required?: boolean;
    disabled?: boolean;
    validate?: Validator | Validator[];
    disableInbuiltValidator?: boolean;    
    tooltip?: string;
    showCopyButton?: boolean;
    copyValue?: string;
    [x: string]: any; //To allow other properties
}

//Encapsulates redux field with label+input+remark+error composite component.
class FormField extends React.Component<FormFieldProps> {

    constructor(props: FormFieldProps) {
        super(props);

        //Validators has to be constructed here and should not be changed later on.
        //Redux form doesn't support changing validators.
        this.validators = props.required && !props.disableInbuiltValidator ? [requiredFieldValidator] : [];
        if (props.validate)
            this.validators.push(Array.isArray(props.validate) ? [...props.validate] : props.validate)
    }

    validators: any[];

    render() {
        const { component, validate, ...rest } = this.props;
        const CustomComponent = component;

        return (
            <Field {...rest}
                validate={this.validators}
                component={FormFieldContent} inputComponent={CustomComponent} />
        )
    }
}

const requiredFieldValidator = (value: string) =>
    (!value || value.trim().length == 0) ? localise("ERROR_FIELD_REQUIRED") : undefined;

export default FormField



// WEBPACK FOOTER //
// ./src/modules/shared/components/Form/FormField.tsx