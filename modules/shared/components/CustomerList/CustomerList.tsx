import * as React from "react";
import { History } from 'history';
import { Row, Col } from "reactstrap";
import { filterBy } from "@progress/kendo-data-query";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import { contextService, routeService } from "../../services";
import { ListItem } from "../../types/dto";
import "./customer-list.css";

interface Props {
    list: ListItem[];
    history: History;
}

interface State {
    filteredList: ListItem[];
}

export class CustomerList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onCustomerChange = this.onCustomerChange.bind(this);
        this.onCustomerFilterChange = this.onCustomerFilterChange.bind(this);

        this.state = {
            filteredList: [...props.list]
        }
    }

    onCustomerChange(event: any) {
        const customer = event.target.value;
        const currentCustomerId = contextService.getCurrentCustomerId();

        if (customer && customer.id != currentCustomerId) {
            contextService.setCurrentCustomer(customer.id);
            contextService.setCurrentDateTimeFormat(customer.dateFormat, customer.timeFormat)            

            if (this.shouldReroute(customer.id)) {
                window.location.href = '#';
            }
            else {
                this.forceUpdate();
            }
        }
    }

    shouldReroute(customerId: string) {
        const route = routeService.getCurrentRoute();
        const section = (route && route.section) || '';
        const isDetailPage = (route && route.isDetailPage) || false;

        return (customerId == '*' && !routeService.adminSections.includes(section)) ||
            (isDetailPage && (section != 'USER' && section != 'CUSTOMER'));
    }

    onCustomerFilterChange(event: any) {
        const { list } = this.props;
        const { filter } = event;
        this.setState({ ...this.state, filteredList: filterBy(list, filter) });
    }

    render() {
        const { filteredList } = this.state;
        const currentCustomerId = contextService.getCurrentCustomerId();
        const customer = filteredList.find(c => c.id == currentCustomerId);

        return (
            <Row className="customer-list">
                <Col>
                    <ComboBox data={filteredList} dataItemKey="id" textField="name" clearButton={false}
                        value={customer} onChange={this.onCustomerChange}
                        filterable={true} onFilterChange={this.onCustomerFilterChange}
                        popupSettings={{ className: 'customer-list-popover', width: 'auto', height: 'auto' }} />
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/CustomerList/CustomerList.tsx