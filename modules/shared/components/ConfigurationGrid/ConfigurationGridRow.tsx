import * as React from 'react';
import { Row, Col, Input } from 'reactstrap';
import { LookupDropDown } from '../LookupDropDown/LookupDropDown';
import { lookupService, confirmDialogService } from '../../services';
import { CabinetConfiguration, LookupItem } from '../../types/dto';

interface Props {
    configuration: CabinetConfiguration;
    onChange?: (configuration?: CabinetConfiguration) => void;
    lookupKey: string;
    isPermittedToEdit?: boolean;
}

export class ConfigurationGridRow extends React.Component<Props> {
    lookupValues: LookupItem[];

    constructor(props: Props) {
        super(props);
        this.onValueChange = this.onValueChange.bind(this);
        this.onClearClick = this.onClearClick.bind(this);
        this.lookupValues = lookupService.getList(props.lookupKey);
    }

    onValueChange(e: any) {
        const { configuration, onChange } = this.props;
        let entry: CabinetConfiguration = { ...configuration, value: e.target.value };
        onChange && onChange(entry);
    }

    onClearClick() {
        let { configuration, onChange } = this.props;

        confirmDialogService.showDialog("CONFIRMATION_CLEAR",
            () => {
                let entry: CabinetConfiguration = { ...configuration, value: undefined };
                onChange && onChange(entry);
            });
    }

    render() {
        const { configuration, lookupKey, isPermittedToEdit } = this.props;
        let lookupValue = this.lookupValues.find(value => value.value == configuration.key);

        return (
            <>
                <Row className="configuration-entry-row mt-3 mb-3 pl-3">
                    <Col className="key-entry-row" xs={4}>
                        <span> {configuration.key && lookupService.getText(lookupKey, configuration.key)} </span>
                    </Col>
                    <Col xs={4}>
                        <span> {configuration.key && lookupService.getRemark(lookupKey, configuration.key)} </span>
                    </Col>
                    <Col xs={3}>
                        {
                            lookupValue && lookupValue.childLookupKey ?
                                <LookupDropDown name="value" lookupKey={lookupValue.childLookupKey} onChange={this.onValueChange}
                                    value={(configuration && (configuration.value || configuration.inheritedValue)) || ""} 
                                    disabled={!isPermittedToEdit}/>
                                :
                                <Input name="value" value={(configuration && configuration.value) || ""} onChange={this.onValueChange}
                                    placeholder={configuration && configuration.inheritedValue} disabled={!isPermittedToEdit}/>
                        }
                    </Col>
                    <Col className="delete-icon-row text-center" xs={1}>
                        {
                            configuration.value ?
                                <span onClick={this.onClearClick}>
                                    <i className="fa fa-times text-danger delete-icon" aria-hidden="true" />
                                </span>
                                :
                                <span>
                                    <i className="fa fa-times text-muted" aria-hidden="true" />
                                </span>
                        }
                    </Col>
                </Row>
                <hr />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/ConfigurationGrid/ConfigurationGridRow.tsx