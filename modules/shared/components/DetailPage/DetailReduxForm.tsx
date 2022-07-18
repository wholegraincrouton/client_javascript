import { reduxForm, FormSubmitHandler } from "redux-form";
import { DetailFormCustomProps, DetailForm } from "./DetailForm";

export interface DetailReduxFormProps extends DetailFormCustomProps {
    initialValues?: any;
    onSubmit?: FormSubmitHandler;
}

export const DetailReduxForm = (name: string, validator?: (item: any) => {}) => {

    const reduxFormGenerator = reduxForm<{}, DetailFormCustomProps>({
        form: name,
        validate: validator,
        enableReinitialize: true
    })

    return reduxFormGenerator(DetailForm) as any;
};



// WEBPACK FOOTER //
// ./src/modules/shared/components/DetailPage/DetailReduxForm.tsx