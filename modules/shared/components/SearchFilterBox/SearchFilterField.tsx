import * as React from "react";
import { Row, Col } from "reactstrap";
import { localise } from "../../services";

interface Props {
    titleKey: string;
    children?: any;
}

export const SearchFilterField = (props: Props) =>
    <>
        <Row className="search-field-title">
            <Col>
                {localise(props.titleKey)}
            </Col>
        </Row>
        <Row className="search-field-input">
            <Col>
                {props.children}
            </Col>
        </Row>
    </>


// WEBPACK FOOTER //
// ./src/modules/shared/components/SearchFilterBox/SearchFilterField.tsx