import * as React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import { lookupService } from "../../services";

interface Props {
    value: string;
    onChange: (e: any) => void;
    disabled?: boolean;
}

export class WeekdayRadioSelection extends React.Component<Props> {
    render() {
        const { value, onChange, disabled } = this.props;
        const items = lookupService.getList("LIST_WEEKDAYS");

        return (
            <Row className="weekdays-selection">
                {
                    items.map(i =>
                        <Col>
                            <Label check>
                                <Input type="radio" name="day" value={i.value} disabled={disabled}
                                    checked={i.value == value} onChange={onChange} />
                                {i.text}
                            </Label>
                        </Col>
                    )
                }
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/WeekdayRadioSelection/WeekdayRadioSelection.tsx