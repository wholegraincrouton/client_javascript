import * as React from "react";
import { Field, Validator } from "redux-form";

interface FormJsonFieldProps {
    component: any;
    valueProp: string;
    changeProp: string;
    validate?: Validator | Validator[];
    [x: string]: any; //To allow other properties
}

//Used to host a form control which uses a complex object instead of a string.
//The complex control should have 'value' and 'onChange' props for value read/write operations.
class FormJsonField extends React.Component<FormJsonFieldProps> {

    constructor(props: FormJsonFieldProps) {
        super(props);
    }

    wrapperComponentInstance?: (props: any) => any = undefined;

    render() {
        const { props } = this;
        const { component, valueProp, changeProp, ...rest } = props;
        const CustomComponent = component;

        if (!this.wrapperComponentInstance)
            this.wrapperComponentInstance = jsonDataComponentWrapper(CustomComponent, valueProp, changeProp)

        return <Field {...rest} component={this.wrapperComponentInstance} />
    }
}

//Wraps the given component's value read/write with JSON conversions.
const jsonDataComponentWrapper = (component: any, valueProp: string, changeProp: string) => (props: any) => {
    const CustomComponent = component;
    const mapping = {
        [valueProp]: props.input.value && JSON.parse(props.input.value),
        [changeProp]: (obj: any) => props.input.onChange(JSON.stringify(obj))
    }

    return <CustomComponent {...props} {...mapping} />
}

export default FormJsonField;


// WEBPACK FOOTER //
// ./src/modules/shared/components/Form/FormJsonField.tsx