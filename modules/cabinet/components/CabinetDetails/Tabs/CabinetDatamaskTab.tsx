import * as React from "react";
import { Row, Col } from "reactstrap";
import { store } from "src/redux/store";
import { localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { DataMaskForm } from "src/modules/shared/components/DataMaskForm/DataMaskForm";
import { DataMaskConfig, DataMaskParentTypes } from "src/modules/shared/types/dto";
import { permissionService } from 'src/modules/shared/services/permission.service';

interface Props {
    showFieldErrors?: boolean;
}

export class CabinetDatamaskTab extends React.Component<DetailFormProps & Props> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(dataMask: DataMaskConfig) {
        this.props.change("dataMask", dataMask.status == "ACTIVE" ? JSON.stringify(dataMask) : '');
    }

    render() {
        const { showFieldErrors, item } = this.props;
        const cabinet = store.getState().form.CabinetDetailsForm.values as any;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("REMARK_CABINET_DATAMASK")}</small>
                    </Col>
                </Row>
                <DataMaskForm parentType={DataMaskParentTypes.Cabinet} onChange={this.onChange} site={cabinet.site}
                    customerId={cabinet.customerId} dataMask={cabinet.dataMask && JSON.parse(cabinet.dataMask)}
                    showFieldErrors={showFieldErrors} isPermittedToEdit={isPermittedToEdit}/>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetDetails/Tabs/CabinetDatamaskTab.tsx