import * as React from "react";
import { localise } from "src/modules/shared/services";
import { Row, Col, Button } from "reactstrap";

interface Props {
    toggleFilter: () => void;
    showFilter: boolean;
}

export class FilterToggle extends React.Component<Props> {
    render() {
        const { toggleFilter, showFilter } = this.props;

        return (
            <Row className="text-right">
                <Col>
                    <Button className="pt-0 pb-0" color="link" onClick={toggleFilter}>
                        <i className={`fas fa-angle-${showFilter ? 'up' : 'down'} fa-lg`} />
                    &nbsp;&nbsp;
                    {localise(`TEXT_${showFilter ? 'HIDE' : 'SHOW_FILTERS'}`)}
                    </Button>
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/shared/FilterToggle.tsx