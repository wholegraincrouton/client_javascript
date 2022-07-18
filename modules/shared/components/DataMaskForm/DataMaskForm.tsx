import * as React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import { localise, lookupService, apiService } from "../../services";
import { checkNumericInput } from "../NumericInput/NumericInput";
import { LookupDropDown } from "../LookupDropDown/LookupDropDown";
import { DataMaskConfig, DataMaskSources, DataMaskParentTypes, defaultDataMaskConfig, DataMaskStatus } from "../../types/dto";
import { ExternalSystem } from "src/modules/externalSystems/types/dto";
import "./datamask-form.css";

interface Props {
    customerId?: string;
    dataMask?: DataMaskConfig;
    onChange: (datamask: DataMaskConfig) => void;
    parentType: string;
    site?: string;
    showFieldErrors?: boolean;
    isPermittedToEdit?: boolean;
}

interface State {
    dataMask: DataMaskConfig;
    customerExternalSystems: ExternalSystem[];
    siteDataMask?: DataMaskConfig;
}

export class DataMaskForm extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        //#region Method Binders

        this.onDataMaskChange = this.onDataMaskChange.bind(this);
        this.onDataMaskStatusChange = this.onDataMaskStatusChange.bind(this);
        this.onDataMaskNameChange = this.onDataMaskNameChange.bind(this);
        this.onTotalBitsChange = this.onTotalBitsChange.bind(this);
        this.onTotalBitsBlur = this.onTotalBitsBlur.bind(this);
        this.onFacilityCodeStartBitChange = this.onFacilityCodeStartBitChange.bind(this);
        this.onFacilityCodeEndBitChange = this.onFacilityCodeEndBitChange.bind(this);
        this.onCardIdStartBitChange = this.onCardIdStartBitChange.bind(this);
        this.onCardIdEndBitChange = this.onCardIdEndBitChange.bind(this);
        this.onIssueCodeStartBitChange = this.onIssueCodeStartBitChange.bind(this);
        this.onIssueCodeEndBitChange = this.onIssueCodeEndBitChange.bind(this);
        this.onFacilityCodeStartBitBlur = this.onFacilityCodeStartBitBlur.bind(this);
        this.onFacilityCodeEndBitBlur = this.onFacilityCodeEndBitBlur.bind(this);
        this.onCardIdStartBitBlur = this.onCardIdStartBitBlur.bind(this);
        this.onCardIdEndBitBlur = this.onCardIdEndBitBlur.bind(this);
        this.onIssueCodeStartBitBlur = this.onIssueCodeStartBitBlur.bind(this);
        this.onIssueCodeEndBitBlur = this.onIssueCodeEndBitBlur.bind(this);
        this.onDataMaskSourceChange = this.onDataMaskSourceChange.bind(this);
        this.onCardTypeChange = this.onCardTypeChange.bind(this);
        this.onFacilityCodeChange = this.onFacilityCodeChange.bind(this);

        //#endregion        

        let dataMask: DataMaskConfig = !props.dataMask ?
            {
                status: DataMaskStatus.Inactive,
                sourceType: props.parentType,
                sourceIdentifier: props.parentType,
                totalBits: 0,
                facilityCodeBitsInfo: {
                    startBit: 0,
                    endBit: 0
                },
                cardDetailsBitsInfo: {
                    startBit: 0,
                    endBit: 0
                },
                issueCodeBitsInfo: {
                    startBit: 0,
                    endBit: 0
                }
            } :
            {
                ...props.dataMask,
                status: DataMaskStatus.Active,
                name: props.dataMask.name || defaultDataMaskConfig.name,
                totalBits: props.dataMask.totalBits || defaultDataMaskConfig.totalBits,
                facilityCodeBitsInfo: props.dataMask.name ? props.dataMask.facilityCodeBitsInfo : defaultDataMaskConfig.facilityCodeBitsInfo,
                cardDetailsBitsInfo: props.dataMask.name ? props.dataMask.cardDetailsBitsInfo : defaultDataMaskConfig.cardDetailsBitsInfo,
                issueCodeBitsInfo: props.dataMask.name ? props.dataMask.issueCodeBitsInfo : defaultDataMaskConfig.issueCodeBitsInfo,
            };

        this.state = {
            dataMask: dataMask as DataMaskConfig,
            customerExternalSystems: []
        }
    }

    componentDidMount() {
        const { customerId, site, parentType } = this.props;

        if (parentType != DataMaskParentTypes.ExternalSystem && customerId) {
            apiService.get('externalsystem', 'GetExternalSystemsWithDataMasksForCustomer', undefined, { customerId: customerId })
                .then((externalSystems: ExternalSystem[]) => {
                    if (parentType == DataMaskParentTypes.Cabinet && site) {
                        apiService.get('site', 'GetDataMaskForSite', undefined, { id: site })
                            .then((dataMask: DataMaskConfig) => {
                                this.setState({
                                    ...this.state,
                                    customerExternalSystems: externalSystems,
                                    siteDataMask: dataMask ? {
                                        ...dataMask,
                                        sourceType: DataMaskSources.Site,
                                        sourceIdentifier: DataMaskSources.Site
                                    } : undefined
                                });
                            });
                    }
                    else {
                        this.setState({
                            ...this.state,
                            customerExternalSystems: externalSystems
                        });
                    }
                });
        }
    }

    getDataMaskBitRow(dataMask: DataMaskConfig) {
        let bars = [];

        for (let i = 1; i <= dataMask.totalBits; i++) {
            let isFacilityBit = i >= dataMask.facilityCodeBitsInfo.startBit && i <= dataMask.facilityCodeBitsInfo.endBit;
            let isCardBit = i >= dataMask.cardDetailsBitsInfo.startBit && i <= dataMask.cardDetailsBitsInfo.endBit;
            let isIssueBit = i >= dataMask.issueCodeBitsInfo.startBit && i <= dataMask.issueCodeBitsInfo.endBit;
            let isEmptyBit = !isFacilityBit && !isCardBit && !isIssueBit;

            let columnClass = isFacilityBit && isCardBit && isIssueBit ? "triple-column" :
                (isFacilityBit && isCardBit && !isIssueBit) || (isFacilityBit && !isCardBit && isIssueBit) ||
                    (!isFacilityBit && isCardBit && isIssueBit) ? "double-column" : "single-column";

            bars.push(
                <Col className="bit-bar pl-0 pr-0 mb-2">
                    <Row className="ml-0 mr-0">
                        {
                            isFacilityBit &&
                            <Col xs={12} className={`${columnClass} pl-0 pr-0 facility-code-bar`} />
                        }
                        {
                            isCardBit &&
                            <Col xs={12} className={`${columnClass} pl-0 pr-0 card-id-bar`} />
                        }
                        {
                            isIssueBit &&
                            <Col xs={12} className={`${columnClass} pl-0 pr-0 issue-code-bar`} />
                        }
                        {
                            isEmptyBit &&
                            <Col xs={12} className="single-column pl-0 pr-0 empty-bar" />
                        }
                        <div className="bit-number">{i}</div>
                    </Row>
                </Col>
            );
        }

        return (
            <Row className="pl-3 pr-0 ml-0 mr-0">
                {bars}
            </Row>
        );
    }

    onDataMaskChange(dataMask: DataMaskConfig) {
        this.props.onChange(dataMask);

        this.setState({
            ...this.state,
            dataMask: dataMask
        });
    }

    //#region Event Handlers

    //#region Field Changes    

    onDataMaskStatusChange(e: any) {
        const { parentType } = this.props;
        let status = e.target.value;

        let dataMask = {
            status: status,
            sourceType: parentType,
            sourceIdentifier: parentType,
            name: status == DataMaskStatus.Active ? defaultDataMaskConfig.name : "",
            cardType: "",
            facilityCode: "",
            totalBits: status == DataMaskStatus.Active ? defaultDataMaskConfig.totalBits : 0,
            facilityCodeBitsInfo: status == DataMaskStatus.Active ? defaultDataMaskConfig.facilityCodeBitsInfo :
                {
                    startBit: 0,
                    endBit: 0
                },
            cardDetailsBitsInfo: status == DataMaskStatus.Active ? defaultDataMaskConfig.cardDetailsBitsInfo :
                {
                    startBit: 0,
                    endBit: 0
                },
            issueCodeBitsInfo: status == DataMaskStatus.Active ? defaultDataMaskConfig.issueCodeBitsInfo :
                {
                    startBit: 0,
                    endBit: 0
                }
        };

        this.onDataMaskChange(dataMask as DataMaskConfig);
    }

    onDataMaskSourceChange(e: any) {
        const { parentType } = this.props;
        const { siteDataMask, customerExternalSystems } = this.state;
        let source = e.target.value;
        let dataMask = {};

        if (source == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet && siteDataMask) {
            dataMask = { ...siteDataMask, status: DataMaskStatus.Active };
        }
        else if (source == DataMaskSources.Site || source == DataMaskSources.Cabinet) {
            dataMask = {
                status: DataMaskStatus.Active,
                sourceType: source,
                sourceIdentifier: source,
                name: defaultDataMaskConfig.name,
                totalBits: defaultDataMaskConfig.totalBits,
                cardType: "",
                facilityCode: "",
                facilityCodeBitsInfo: defaultDataMaskConfig.facilityCodeBitsInfo,
                cardDetailsBitsInfo: defaultDataMaskConfig.cardDetailsBitsInfo,
                issueCodeBitsInfo: defaultDataMaskConfig.issueCodeBitsInfo
            };
        }
        else {
            let externalSystem = customerExternalSystems.find(e => e.id == source);

            if (externalSystem && externalSystem.dataMasks && externalSystem.dataMasks.length > 0) {
                let dataMaskObj = externalSystem.dataMasks[0];

                if (dataMaskObj) {
                    dataMask = {
                        ...dataMaskObj,
                        status: DataMaskStatus.Active,
                        sourceType: DataMaskSources.ExternalSystem,
                        sourceIdentifier: source
                    };
                }
            }
            else {
                dataMask = {
                    status: DataMaskStatus.Active,
                    sourceType: DataMaskSources.ExternalSystem,
                    sourceIdentifier: source,
                    name: "",
                    cardType: "",
                    facilityCode: "",
                    totalBits: 0,
                    facilityCodeBitsInfo: {
                        startBit: 0,
                        endBit: 0
                    },
                    cardDetailsBitsInfo: {
                        startBit: 0,
                        endBit: 0
                    },
                    issueCodeBitsInfo: {
                        startBit: 0,
                        endBit: 0
                    }
                };
            }
        }

        this.onDataMaskChange(dataMask as DataMaskConfig);
    }

    onDataMaskNameChange(e: any) {
        const { dataMask, customerExternalSystems } = this.state;
        let value = e.target.value;

        if (dataMask.sourceType == DataMaskSources.ExternalSystem) {
            let externalSystem = customerExternalSystems.find(e => e.id == dataMask.sourceIdentifier);

            if (externalSystem && externalSystem.dataMasks && externalSystem.dataMasks.length > 0) {
                let dataMaskObj = externalSystem.dataMasks.find(dm => dm.id == value);

                if (dataMaskObj) {
                    let newDataMask = {
                        ...dataMaskObj,
                        status: DataMaskStatus.Active,
                        sourceType: dataMask.sourceType,
                        sourceIdentifier: dataMask.sourceIdentifier
                    };

                    this.onDataMaskChange(newDataMask as DataMaskConfig);
                }
            }
        }
        else {
            let newDataMask = {
                ...dataMask,
                name: value
            };

            this.onDataMaskChange(newDataMask as DataMaskConfig);
        }
    }

    onCardTypeChange(e: any) {
        let newDataMask = {
            ...this.state.dataMask,
            cardType: e.target.value
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onFacilityCodeChange(e: any) {
        let newDataMask = {
            ...this.state.dataMask,
            facilityCode: e.target.value
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onTotalBitsChange(e: any) {
        e.preventDefault();
        const { dataMask } = this.state;
        let value = e.target.value > 256 ? 256 : e.target.value < 0 ? 0 : e.target.value;

        let newDataMask = {
            ...dataMask,
            totalBits: value
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onTotalBitsBlur(e: any) {
        const { dataMask } = this.state;

        let newDataMask = {
            ...dataMask,
            facilityCodeBitsInfo: {
                startBit: +dataMask.facilityCodeBitsInfo.startBit > +e.target.value ? +e.target.value : dataMask.facilityCodeBitsInfo.startBit,
                endBit: +dataMask.facilityCodeBitsInfo.endBit > +e.target.value ? +e.target.value : dataMask.facilityCodeBitsInfo.endBit
            },
            cardDetailsBitsInfo: {
                startBit: +dataMask.cardDetailsBitsInfo.startBit > +e.target.value ? +e.target.value : dataMask.cardDetailsBitsInfo.startBit,
                endBit: +dataMask.cardDetailsBitsInfo.endBit > +e.target.value ? +e.target.value : dataMask.cardDetailsBitsInfo.endBit
            },
            issueCodeBitsInfo: {
                startBit: +dataMask.issueCodeBitsInfo.startBit > +e.target.value ? +e.target.value : dataMask.issueCodeBitsInfo.startBit,
                endBit: +dataMask.issueCodeBitsInfo.endBit > +e.target.value ? +e.target.value : dataMask.issueCodeBitsInfo.endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    //#endregion

    //#region Bit Events

    //#region Change Events

    onFacilityCodeStartBitChange(e: any) {
        const { dataMask } = this.state;
        let startBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        let newDataMask = {
            ...dataMask,
            facilityCodeBitsInfo: {
                ...dataMask.facilityCodeBitsInfo,
                startBit: startBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onFacilityCodeEndBitChange(e: any) {
        const { dataMask } = this.state;
        let endBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        let newDataMask = {
            ...dataMask,
            facilityCodeBitsInfo: {
                ...dataMask.facilityCodeBitsInfo,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onCardIdStartBitChange(e: any) {
        const { dataMask } = this.state;
        let startBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        let newDataMask = {
            ...dataMask,
            cardDetailsBitsInfo: {
                ...dataMask.cardDetailsBitsInfo,
                startBit: startBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onCardIdEndBitChange(e: any) {
        const { dataMask } = this.state;
        let endBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        let newDataMask = {
            ...dataMask,
            cardDetailsBitsInfo: {
                ...dataMask.cardDetailsBitsInfo,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onIssueCodeStartBitChange(e: any) {
        const { dataMask } = this.state;
        let startBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        let newDataMask = {
            ...dataMask,
            issueCodeBitsInfo: {
                ...dataMask.issueCodeBitsInfo,
                startBit: startBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onIssueCodeEndBitChange(e: any) {
        const { dataMask } = this.state;
        let endBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        let newDataMask = {
            ...dataMask,
            issueCodeBitsInfo: {
                ...dataMask.issueCodeBitsInfo,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    //#endregion

    //#region Blur Events

    onFacilityCodeStartBitBlur(e: any) {
        const { dataMask } = this.state;
        let startBit = e.target.value || 0;
        let endBit = startBit == 0 ? 0 : +startBit > dataMask.facilityCodeBitsInfo.endBit ? startBit : dataMask.facilityCodeBitsInfo.endBit;

        let newDataMask = {
            ...dataMask,
            facilityCodeBitsInfo: {
                startBit: startBit,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onFacilityCodeEndBitBlur(e: any) {
        const { dataMask } = this.state;
        let endBit = e.target.value || 0;
        let startBit = endBit == 0 ? 0 : +endBit < dataMask.facilityCodeBitsInfo.startBit ? endBit : dataMask.facilityCodeBitsInfo.startBit;

        let newDataMask = {
            ...dataMask,
            facilityCodeBitsInfo: {
                startBit: startBit,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onCardIdStartBitBlur(e: any) {
        const { dataMask } = this.state;
        let startBit = e.target.value || 0;
        let endBit = startBit == 0 ? 0 : +startBit > dataMask.cardDetailsBitsInfo.endBit ? startBit : dataMask.cardDetailsBitsInfo.endBit;

        let newDataMask = {
            ...dataMask,
            cardDetailsBitsInfo: {
                startBit: startBit,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onCardIdEndBitBlur(e: any) {
        const { dataMask } = this.state;
        let endBit = e.target.value || 0;
        let startBit = endBit == 0 ? 0 : +endBit < dataMask.cardDetailsBitsInfo.startBit ? endBit : dataMask.cardDetailsBitsInfo.startBit;

        let newDataMask = {
            ...dataMask,
            cardDetailsBitsInfo: {
                startBit: startBit,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onIssueCodeStartBitBlur(e: any) {
        const { dataMask } = this.state;
        let startBit = e.target.value || 0;
        let endBit = startBit == 0 ? 0 : +startBit > dataMask.issueCodeBitsInfo.endBit ? startBit : dataMask.issueCodeBitsInfo.endBit;

        let newDataMask = {
            ...dataMask,
            issueCodeBitsInfo: {
                startBit: startBit,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    onIssueCodeEndBitBlur(e: any) {
        const { dataMask } = this.state;
        let endBit = e.target.value || 0;
        let startBit = endBit == 0 ? 0 : +endBit < dataMask.issueCodeBitsInfo.startBit ? endBit : dataMask.issueCodeBitsInfo.startBit;

        let newDataMask = {
            ...dataMask,
            issueCodeBitsInfo: {
                startBit: startBit,
                endBit: endBit
            }
        };

        this.onDataMaskChange(newDataMask as DataMaskConfig);
    }

    //#endregion

    //#endregion

    //#endregion

    render() {
        const { parentType, showFieldErrors, isPermittedToEdit } = this.props;
        const { dataMask, customerExternalSystems, siteDataMask } = this.state;

        let dataMaskList: DataMaskConfig[] = [];

        if (dataMask.sourceType == DataMaskSources.ExternalSystem) {
            let externalSystem = customerExternalSystems.find(e => e.id == dataMask.sourceIdentifier);

            if (externalSystem && externalSystem.dataMasks && externalSystem.dataMasks.length > 0) {
                dataMaskList = externalSystem.dataMasks.filter(dm => dm.name != null);
            }
        }

        return (
            <Row className="datamask-form pr-2">
                <Col>
                    <Row className="mb-3">
                        <Col>
                            <Row className="mb-2">
                                <Col xl={3} lg={4} md={6}>
                                    <Label className="system-label pt-1 pl-3">{localise("TEXT_DATA_MASK_STATUS")}:</Label>
                                </Col>
                                <Col xl={4} md={6}>
                                    <LookupDropDown lookupKey="LIST_DATA_MASK_STATUS" value={dataMask.status}
                                        onChange={this.onDataMaskStatusChange} disabled={!isPermittedToEdit}/>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xl={3} lg={4} md={6}>
                                    <Label className="system-label pt-1 pl-3">{localise("TEXT_DATA_MASK_SOURCE")}:</Label>
                                </Col>
                                <Col xl={4} md={6}>
                                    {
                                        dataMask.sourceType == DataMaskSources.IntegrationSystem ?
                                            <Input value={lookupService.getText("LIST_INTEGRATION_SYSTEMS", dataMask.sourceIdentifier || "")} disabled />
                                            :
                                            <Input type="select" disabled={dataMask.status == DataMaskStatus.Inactive || !isPermittedToEdit}
                                                value={dataMask.sourceIdentifier} onChange={this.onDataMaskSourceChange} >
                                                <option value="" className="d-none"></option>
                                                {customerExternalSystems.map((e, key) =>
                                                    <option value={e.id} key={key} >{lookupService.getText("LIST_INTEGRATION_SYSTEMS", e.integrationSystem)}</option>)}
                                                {(parentType == DataMaskParentTypes.Site || siteDataMask) && <option value="SITE">{localise("TEXT_SITE")}</option>}
                                                {parentType == DataMaskParentTypes.Cabinet && <option value="CABINET">{localise("TEXT_CABINET")}</option>}
                                            </Input>
                                    }
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xl={3} lg={4} md={6}>
                                    <Label className="system-label pt-1 pl-3">{localise("TEXT_DATA_MASK_NAME")}:</Label>
                                </Col>
                                <Col xl={4} md={6}>
                                    {
                                        dataMask.sourceType == DataMaskSources.ExternalSystem ?
                                            <Input type="select" onChange={this.onDataMaskNameChange} value={dataMask.id}>
                                                <option value="" className="d-none"></option>
                                                {
                                                    dataMaskList.map((dm, key) => <option value={dm.id} key={key}>{dm.name}</option>)
                                                }
                                            </Input> :
                                            <Input value={dataMask.name} onChange={this.onDataMaskNameChange}
                                                disabled={dataMask.status == DataMaskStatus.Inactive ||
                                                    (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                                    || !isPermittedToEdit}/>
                                    }
                                    {
                                        showFieldErrors && !dataMask.name &&
                                        <small className="text-danger">{localise('ERROR_FIELD_REQUIRED')}</small>
                                    }
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xl={3} lg={4} md={6}>
                                    <Label className="system-label pt-1 pl-3">{localise("TEXT_CARD_TYPE")}:</Label>
                                </Col>
                                <Col xl={4} md={6}>
                                    <Input value={dataMask.cardType} onChange={this.onCardTypeChange}
                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                            dataMask.sourceType == DataMaskSources.IntegrationSystem ||
                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                            || !isPermittedToEdit} />
                                    {
                                        showFieldErrors && !dataMask.cardType && dataMask.sourceType != DataMaskSources.ExternalSystem &&
                                        <small className="text-danger">{localise('ERROR_FIELD_REQUIRED')}</small>
                                    }
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xl={3} lg={4} md={6}>
                                    <Label className="system-label pt-1 pl-3">{localise("TEXT_TOTAL_BITS")}:</Label>
                                </Col>
                                <Col xl={4} md={6}>
                                    <Input type="number" value={dataMask.totalBits} onChange={this.onTotalBitsChange}
                                        onKeyPress={checkNumericInput} onBlur={this.onTotalBitsBlur}
                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                            || !isPermittedToEdit} />
                                    {
                                        showFieldErrors && dataMask.totalBits == 0 && dataMask.sourceType != DataMaskSources.ExternalSystem &&
                                        <small className="text-danger">{localise("ERROR_DATA_MASK_LENGTH")}</small>
                                    }
                                </Col>
                            </Row>
                            <Row>
                                <Col xl={3} lg={4} md={6}>
                                    <Label className="system-label pt-1 pl-3">{localise("TEXT_FACILITY_CODE")}:</Label>
                                </Col>
                                <Col xl={4} md={6}>
                                    <Input value={dataMask.facilityCode} onChange={this.onFacilityCodeChange}
                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                            dataMask.sourceType == DataMaskSources.IntegrationSystem ||
                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                            || !isPermittedToEdit} />
                                    {
                                        showFieldErrors && !dataMask.facilityCode && dataMask.sourceType != DataMaskSources.ExternalSystem &&
                                        <small className="text-danger">{localise('ERROR_FIELD_REQUIRED')}</small>
                                    }
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Row className="mb-2">
                                <Col>
                                    <Label className="system-label pl-3">{localise("TEXT_DATA_MASK_FORMAT")}:</Label>
                                </Col>
                            </Row>
                            {
                                dataMask.totalBits > 0 &&
                                <Row className="data-mask-graph mb-2">
                                    <Col>
                                        {this.getDataMaskBitRow(dataMask)}
                                    </Col>
                                </Row>
                            }
                            <Row className="data-mask-bits pl-5 mb-1">
                                <Col className="data-mask-bits-section">
                                    <Row>
                                        <Col xs={1} className="facility-code-bar pl-0 mt-1 mb-1" />
                                        <Col className="pl-2">
                                            <Row>
                                                <Col>
                                                    <Label className="color-blue">{localise("TEXT_FACILITY_CODE")}</Label>
                                                </Col>
                                            </Row>
                                            <Row className="mb-1">
                                                <Col xl={4} lg={5} className="pt-1 pr-0">
                                                    <Label>{localise("TEXT_START_BIT")}</Label>
                                                </Col>
                                                <Col className="pl-0">
                                                    <Input className="data-mask-bit-input"
                                                        value={dataMask.facilityCodeBitsInfo.startBit}
                                                        type="number" onChange={this.onFacilityCodeStartBitChange}
                                                        onKeyPress={checkNumericInput} onBlur={this.onFacilityCodeStartBitBlur}
                                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                                            || !isPermittedToEdit} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xl={4} lg={5} className="pt-1 pr-0">
                                                    <Label>{localise("TEXT_END_BIT")}</Label>
                                                </Col>
                                                <Col className="pl-0">
                                                    <Input className="data-mask-bit-input"
                                                        value={dataMask.facilityCodeBitsInfo.endBit}
                                                        type="number" onChange={this.onFacilityCodeEndBitChange}
                                                        onKeyPress={checkNumericInput} onBlur={this.onFacilityCodeEndBitBlur}
                                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                                            || !isPermittedToEdit} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="data-mask-bits-section">
                                    <Row>
                                        <Col xs={1} className="card-id-bar pl-0 mt-1 mb-1" />
                                        <Col className="pl-2">
                                            <Row>
                                                <Col>
                                                    <Label className="color-blue">{localise("TEXT_CARD_ID_CODE")}</Label>
                                                </Col>
                                            </Row>
                                            <Row className="mb-1">
                                                <Col xl={4} lg={5} className="pt-1 pr-0">
                                                    <Label>{localise("TEXT_START_BIT")}</Label>
                                                </Col>
                                                <Col className="pl-0">
                                                    <Input className="data-mask-bit-input"
                                                        value={dataMask.cardDetailsBitsInfo.startBit}
                                                        type="number" onChange={this.onCardIdStartBitChange} name="start-bit"
                                                        onKeyPress={checkNumericInput} onBlur={this.onCardIdStartBitBlur}
                                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                                            || !isPermittedToEdit} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xl={4} lg={5} className="pt-1 pr-0">
                                                    <Label>{localise("TEXT_END_BIT")}</Label>
                                                </Col>
                                                <Col className="pl-0">
                                                    <Input className="data-mask-bit-input"
                                                        value={dataMask.cardDetailsBitsInfo.endBit}
                                                        type="number" onChange={this.onCardIdEndBitChange}
                                                        onKeyPress={checkNumericInput} onBlur={this.onCardIdEndBitBlur}
                                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                                            || !isPermittedToEdit} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="data-mask-bits-section">
                                    <Row>
                                        <Col xs={1} className="issue-code-bar pl-0 mt-1 mb-1" />
                                        <Col className="pl-2">
                                            <Row>
                                                <Col>
                                                    <Label className="color-blue">{localise("TEXT_ISSUE_CODE")}</Label>
                                                </Col>
                                            </Row>
                                            <Row className="mb-1">
                                                <Col xl={4} lg={5} className="pt-1 pr-0">
                                                    <Label>{localise("TEXT_START_BIT")}</Label>
                                                </Col>
                                                <Col className="pl-0">
                                                    <Input className="data-mask-bit-input"
                                                        value={dataMask.issueCodeBitsInfo.startBit}
                                                        type="number" onChange={this.onIssueCodeStartBitChange}
                                                        onKeyPress={checkNumericInput} onBlur={this.onIssueCodeStartBitBlur}
                                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                                            || !isPermittedToEdit} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xl={4} lg={5} className="pt-1 pr-0">
                                                    <Label>{localise("TEXT_END_BIT")}</Label>
                                                </Col>
                                                <Col className="pl-0">
                                                    <Input className="data-mask-bit-input"
                                                        value={dataMask.issueCodeBitsInfo.endBit}
                                                        type="number" onChange={this.onIssueCodeEndBitChange}
                                                        onKeyPress={checkNumericInput} onBlur={this.onIssueCodeEndBitBlur}
                                                        disabled={dataMask.status == DataMaskStatus.Inactive ||
                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)
                                                            || !isPermittedToEdit} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/DataMaskForm/DataMaskForm.tsx