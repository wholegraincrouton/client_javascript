import * as React from "react";
import { TimeDurations } from "../../types/dto";
import { Button, Row } from "reactstrap";
import "./time-duration-picker.css"
import { localise } from "../../services";

interface Props {
    value?: string;
    onChange: (duration: string) => void;
}

interface State {
    selectedValue: string;
}

export class TimeDurationPicker extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onDurationChange = this.onDurationChange.bind(this);

        this.state = {
            selectedValue: props.value || TimeDurations.Weekly
        }
    }

    onDurationChange(duration: string) {
        if (duration != this.state.selectedValue) {
            this.props.onChange(duration);

            this.setState({
                ...this.state,
                selectedValue: duration
            });
        }
    }

    render() {
        const { selectedValue } = this.state;

        return (
            <Row className="button-list time-duration-picker">
                <Button title={localise("TEXT_WEEKLY")} onClick={() => this.onDurationChange(TimeDurations.Weekly)}
                    className={`mr-2${selectedValue == TimeDurations.Weekly ? " selected" : ""}`}>{localise("TEXT_W")}</Button>
                <Button title={localise("TEXT_FORTNIGHTLY")} onClick={() => this.onDurationChange(TimeDurations.Fortnightly)}
                    className={`mr-2${selectedValue == TimeDurations.Fortnightly ? " selected" : ""}`}>{localise("TEXT_F")}</Button>
                <Button title={localise("TEXT_MONTHLY")} onClick={() => this.onDurationChange(TimeDurations.Monthly)}
                    className={`mr-2${selectedValue == TimeDurations.Monthly ? " selected" : ""}`}>{localise("TEXT_M")}</Button>
                <Button title={localise("TEXT_QUARTERLY")} onClick={() => this.onDurationChange(TimeDurations.Quarterly)}
                    className={`mr-2${selectedValue == TimeDurations.Quarterly ? " selected" : ""}`}>{localise("TEXT_Q")}</Button>
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/TimeDurationPicker/TimeDurationPicker.tsx