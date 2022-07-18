import * as React from "react";
import { Row, Col } from "reactstrap";
import { store } from "src/redux/store";
import { localise, permissionService } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { DataMaskForm } from "src/modules/shared/components/DataMaskForm/DataMaskForm";
import { DataMaskConfig, DataMaskParentTypes } from "src/modules/shared/types/dto";

interface Props {
    showFieldErrors?: boolean;
}

export class SiteCabientsDatamaskTab extends React.Component<DetailFormProps & Props> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(dataMask: DataMaskConfig) {
        this.props.change("dataMask", dataMask.status == "ACTIVE" ? JSON.stringify(dataMask) : '');
    }

    render() {
        const { showFieldErrors, item } = this.props;
        const site = store.getState().form.SiteDetailsForm.values as any;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("REMARK_SITECABINETS_DATAMASK")}</small>
                    </Col>
                </Row>
                <DataMaskForm customerId={site.customerId} parentType={DataMaskParentTypes.Site}
                    onChange={this.onChange} dataMask={site.dataMask && JSON.parse(site.dataMask)}
                    showFieldErrors={showFieldErrors} isPermittedToEdit={isPermittedToEdit}/>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/sites/components/SiteDetails/Tabs/SiteCabinetsDatamaskTab.tsx