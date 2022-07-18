import * as React from "react";
import { Row, Col } from "reactstrap";
import { localise, lookupService } from "../../services";
import { CabinetConfiguration } from "../../types/dto";
import { ConfigurationGridRow } from "./ConfigurationGridRow";
import "./configuration-grid.css";
import { siteService } from "src/modules/sites/services/site.service";

interface Props {
    configurations: CabinetConfiguration[];
    onChange: (configurations: CabinetConfiguration[]) => void;
    lookupkey: string;
    excludedLookupKey?: string;
    site?: string;
    isPermittedToEdit?: boolean
}

interface State {
    configurations: CabinetConfiguration[];
    inheritedConfigurations?: CabinetConfiguration[];
}

export class ConfigurationGrid extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.getInitialConfigurations = this.getInitialConfigurations.bind(this);
        this.onChange = this.onChange.bind(this);

        this.state = {
            configurations: this.getInitialConfigurations()
        }
    }

    componentDidMount() {
        const { site } = this.props;

        site && siteService.getSiteConfigurations(site)
            .then((configs) => {
                this.setState({
                    ...this.state,
                    inheritedConfigurations: configs
                });
            });
    }

    getInitialConfigurations() {
        const { lookupkey, excludedLookupKey } = this.props;        
        let configs = lookupService.getList(lookupkey).filter(c => c.value);

        if (excludedLookupKey) {
            const excludedLookup = lookupService.getList(excludedLookupKey);
            configs = configs.filter(c => c.value && !excludedLookup.some(i => i.value == c.value));
        }
        
        let mappedConfigs = configs.map((l) => {
            let config = {
                key: l.value
            } as CabinetConfiguration;

            let savedConfig = this.props.configurations.find(c => c.key == config.key);
            if (savedConfig != undefined) {
                config.value = savedConfig.value;
            }
            return config;
        });

        return mappedConfigs;
    }

    onChange(configuration: CabinetConfiguration) {
        const { onChange } = this.props;

        let configurations = this.state.configurations;
        let existingEntry = configurations.find(c => c.key == configuration.key);

        if (existingEntry) {
            existingEntry.value = configuration.value;
        }

        onChange(configurations.filter(c => c.value));

        this.setState({
            ...this.state,
            configurations: configurations
        });
    }

    render() {
        const { configurations, inheritedConfigurations } = this.state;
        const { lookupkey, isPermittedToEdit } = this.props;

        if (inheritedConfigurations) {
            configurations.map((c) => {
                let inheritedConfigValue = inheritedConfigurations.find(i => i.key == c.key);
                if (inheritedConfigValue) {
                    c.inheritedValue = inheritedConfigValue.value;
                }
            });
        }

        return (
            <Row className="configuration-grid">
                <Col>
                    <Row className="configuration-grid-header bg-blue">
                        <Col className="key-title-row" xs={4}>{localise("TEXT_CONFIGURATION")}</Col>
                        <Col xs={4}>{localise("TEXT_DESCRIPTION")}</Col>
                        <Col xs={3}>{localise("TEXT_CABINET_CONFIGURATION_VALUE")}</Col>
                        <Col xs={1} />
                    </Row>
                    <Row className="configuration-grid-body">
                        <Col>
                            {
                                configurations.map((configuration, key) =>
                                    <ConfigurationGridRow key={key} lookupKey={lookupkey} isPermittedToEdit={isPermittedToEdit}
                                        configuration={configuration} onChange={this.onChange}/>)
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/ConfigurationGrid/ConfigurationGrid.tsx