import * as React from "react";
import { Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { CabinetItem } from "src/modules/cabinet/types/dto";
import { CabinetItemsGrid } from "../CabinetItemsGrid";
import { store } from "src/redux/store";
import { permissionService } from '../../../../shared/services/permission.service';

interface Props {
    error?: string;
}

export class CabinetItemsTab extends React.Component<DetailFormProps & Props> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(items: CabinetItem[]) {
        this.props.change("items", JSON.stringify(items));
    }

    render() {
        const { error, item } = this.props;
        const cabinet = store.getState().form.CabinetDetailsForm.values as any;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
              
        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("TEXT_CABINET_ITEMS_DESCRIPTION")}</small>
                    </Col>
                </Row>
                <CabinetItemsGrid items={JSON.parse(cabinet.items)} site={cabinet.site} onChange={this.onChange}
                    cabinetConfigs={JSON.parse(cabinet.configurations)} customerId={cabinet.customerId} error={error}
                    isPermittedToEdit={isPermittedToEdit} />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetDetails/Tabs/CabinetItemsTab.tsx