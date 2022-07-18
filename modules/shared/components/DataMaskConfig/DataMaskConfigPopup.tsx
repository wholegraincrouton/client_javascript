import * as React from "react";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Row, Col, Label, Input } from "reactstrap";
import { globalDirtyService, localise, apiService, lookupService } from "../../services";
import { BackButton, SaveButton } from "../ActionButtons/ActionButtons";
import { DataMaskConfig, defaultDataMaskConfig, DataMaskSources, DataMaskParentTypes } from "../../types/dto";
import { checkNumericInput } from "../NumericInput/NumericInput";
import { ExternalSystem, IntegrationSystems } from "src/modules/externalSystems/types/dto";
import "./datamask-config.css";

interface Props {
    customerId?: string;
    site?: string;
    parentType: string;
    integrationSystem?: string;
    dataMask?: DataMaskConfig;
    onBack: () => void;
    onSave: (datamask: DataMaskConfig) => void;
}

interface State {
    dataMask: DataMaskConfig;
    isDirty: boolean;
    showFieldErrors: boolean;
    showBitsError: boolean;
    customerExternalSystems: ExternalSystem[];
    siteDataMask?: DataMaskConfig;
}

export class DataMaskConfigPopup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        //#region Method Binders

        this.dirtyPageHandler = this.dirtyPageHandler.bind(this);
        this.onBackClick = this.onBackClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
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
                sourceType: DataMaskSources.NotApplicable,
                sourceIdentifier: DataMaskSources.NotApplicable,
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
                name: props.dataMask.name || defaultDataMaskConfig.name,
                totalBits: props.dataMask.totalBits || defaultDataMaskConfig.totalBits,
                facilityCodeBitsInfo: props.dataMask.name ? props.dataMask.facilityCodeBitsInfo : defaultDataMaskConfig.facilityCodeBitsInfo,
                cardDetailsBitsInfo: props.dataMask.name ? props.dataMask.cardDetailsBitsInfo : defaultDataMaskConfig.cardDetailsBitsInfo,
                issueCodeBitsInfo: props.dataMask.name ? props.dataMask.issueCodeBitsInfo : defaultDataMaskConfig.issueCodeBitsInfo,
            };

        this.state = {
            dataMask: dataMask as DataMaskConfig,
            isDirty: props.dataMask != null && !props.dataMask.name,
            showFieldErrors: false,
            showBitsError: false,
            customerExternalSystems: []
        }
        window.addEventListener("beforeunload", this.dirtyPageHandler);
    }

    componentDidMount() {
        if (this.props.parentType != DataMaskParentTypes.ExternalSystem && this.props.customerId) {
            apiService.get('externalsystem', 'GetExternalSystemsWithDataMasksForCustomer', undefined, { customerId: this.props.customerId })
                .then((externalSystems: ExternalSystem[]) => {
                    if (this.props.parentType == DataMaskParentTypes.Cabinet && this.props.site) {
                        apiService.get('site', 'GetDataMaskForSite', undefined, { id: this.props.site })
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

    //#region Event Handlers

    dirtyPageHandler(e: any) {
        if (this.state.isDirty) {
            e.returnValue = "";
            return "";
        }
        return;
    }

    //#region Button Clicks

    onBackClick() {
        const { onBack } = this.props;
        const { isDirty } = this.state;

        if (isDirty) {
            globalDirtyService.showDirtyConfirmation(() => {
                window.removeEventListener("beforeunload", this.dirtyPageHandler);
                onBack();
            })
            return;
        }
        onBack();
    }

    onSaveClick() {
        const { onSave } = this.props;
        const { dataMask } = this.state;

        if (this.areRequiredFieldsEmpty(dataMask)) {
            this.setState({
                ...this.state,
                showFieldErrors: true
            });
        }
        else if ((this.areRequiredBitsEmpty(dataMask) || this.areBitsOverlapping(dataMask))) {
            this.setState({
                ...this.state,
                showBitsError: true
            });
        }
        else {
            onSave(dataMask);
            window.removeEventListener("beforeunload", this.dirtyPageHandler);

            this.setState({
                ...this.state,
                showFieldErrors: false,
                showBitsError: false
            });
        }
    }

    //#endregion

    //#region Field Changes    

    onDataMaskSourceChange(e: any) {
        const { parentType } = this.props;
        const { siteDataMask } = this.state;
        let source = e.target.value;

        if (source == DataMaskSources.NotApplicable) {
            this.setState({
                ...this.state,
                dataMask: {
                    sourceType: source,
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
                },
                isDirty: true
            });
        }
        else if (source == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet && siteDataMask) {
            this.setState({
                ...this.state,
                dataMask: siteDataMask,
                isDirty: true
            });
        }
        else if (source == DataMaskSources.Site || source == DataMaskSources.Cabinet) {
            this.setState({
                ...this.state,
                dataMask: {
                    sourceType: source,
                    sourceIdentifier: source,
                    name: defaultDataMaskConfig.name,
                    totalBits: defaultDataMaskConfig.totalBits,
                    cardType: "",
                    facilityCode: "",
                    facilityCodeBitsInfo: defaultDataMaskConfig.facilityCodeBitsInfo,
                    cardDetailsBitsInfo: defaultDataMaskConfig.cardDetailsBitsInfo,
                    issueCodeBitsInfo: defaultDataMaskConfig.issueCodeBitsInfo
                },
                isDirty: true
            });
        }
        else {
            this.setState({
                ...this.state,
                dataMask: {
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
                },
                isDirty: true
            });
        }
    }

    onDataMaskNameChange(e: any) {
        const { dataMask, customerExternalSystems } = this.state;
        let value = e.target.value;

        if (dataMask.sourceType == DataMaskSources.ExternalSystem) {
            let externalSystem = customerExternalSystems.find(e => e.id == dataMask.sourceIdentifier);

            if (externalSystem && externalSystem.dataMasks && externalSystem.dataMasks.length > 0) {
                let dataMaskObj = externalSystem.dataMasks.find(dm => dm.id == value);

                if (dataMaskObj) {
                    this.setState({
                        ...this.state,
                        dataMask: {
                            ...dataMaskObj,
                            sourceType: dataMask.sourceType,
                            sourceIdentifier: dataMask.sourceIdentifier
                        },
                        isDirty: true
                    });
                }
            }
        }
        else {
            this.setState({
                ...this.state,
                dataMask: {
                    ...dataMask,
                    name: value
                },
                isDirty: true
            });
        }
    }

    onCardTypeChange(e: any) {
        this.setState({
            ...this.state,
            dataMask: {
                ...this.state.dataMask,
                cardType: e.target.value
            },
            isDirty: true
        });
    }

    onFacilityCodeChange(e: any) {
        this.setState({
            ...this.state,
            dataMask: {
                ...this.state.dataMask,
                facilityCode: e.target.value
            },
            isDirty: true
        });
    }

    onTotalBitsChange(e: any) {
        e.preventDefault();
        const { dataMask } = this.state;
        let value = e.target.value > 256 ? 256 : e.target.value < 0 ? 0 : e.target.value;

        this.setState({
            ...this.state,
            dataMask: {
                ...dataMask,
                totalBits: value
            },
            isDirty: true
        });
    }

    onTotalBitsBlur(e: any) {
        const { dataMask } = this.state;

        this.setState({
            ...this.state,
            dataMask: {
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
            },
            isDirty: true
        });
    }

    //#endregion

    //#region Bit Events

    //#region Change Events

    onFacilityCodeStartBitChange(e: any) {
        const { dataMask } = this.state;
        let startBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        this.setState({
            ...this.state,
            dataMask: {
                ...dataMask,
                facilityCodeBitsInfo: {
                    ...dataMask.facilityCodeBitsInfo,
                    startBit: startBit
                }
            },
            isDirty: true
        });
    }

    onFacilityCodeEndBitChange(e: any) {
        const { dataMask } = this.state;
        let endBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        this.setState({
            ...this.state,
            dataMask: {
                ...this.state.dataMask,
                facilityCodeBitsInfo: {
                    ...dataMask.facilityCodeBitsInfo,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    onCardIdStartBitChange(e: any) {
        const { dataMask } = this.state;
        let startBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        this.setState({
            ...this.state,
            dataMask: {
                ...this.state.dataMask,
                cardDetailsBitsInfo: {
                    ...dataMask.cardDetailsBitsInfo,
                    startBit: startBit
                }
            },
            isDirty: true
        });
    }

    onCardIdEndBitChange(e: any) {
        const { dataMask } = this.state;
        let endBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        this.setState({
            ...this.state,
            dataMask: {
                ...this.state.dataMask,
                cardDetailsBitsInfo: {
                    ...dataMask.cardDetailsBitsInfo,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    onIssueCodeStartBitChange(e: any) {
        const { dataMask } = this.state;
        let startBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        this.setState({
            ...this.state,
            dataMask: {
                ...this.state.dataMask,
                issueCodeBitsInfo: {
                    ...dataMask.issueCodeBitsInfo,
                    startBit: startBit
                }
            },
            isDirty: true
        });
    }

    onIssueCodeEndBitChange(e: any) {
        const { dataMask } = this.state;
        let endBit = +e.target.value > dataMask.totalBits ? dataMask.totalBits : +e.target.value < 0 ? 0 : e.target.value;

        this.setState({
            ...this.state,
            dataMask: {
                ...this.state.dataMask,
                issueCodeBitsInfo: {
                    ...dataMask.issueCodeBitsInfo,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    //#endregion

    //#region Blur Events

    onFacilityCodeStartBitBlur(e: any) {
        const { dataMask } = this.state;
        let startBit = e.target.value || 0;
        let endBit = startBit == 0 ? 0 : +startBit > dataMask.facilityCodeBitsInfo.endBit ? startBit : dataMask.facilityCodeBitsInfo.endBit;

        this.setState({
            ...this.state,
            dataMask: {
                ...dataMask,
                facilityCodeBitsInfo: {
                    startBit: startBit,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    onFacilityCodeEndBitBlur(e: any) {
        const { dataMask } = this.state;
        let endBit = e.target.value || 0;
        let startBit = endBit == 0 ? 0 : +endBit < dataMask.facilityCodeBitsInfo.startBit ? endBit : dataMask.facilityCodeBitsInfo.startBit;

        this.setState({
            ...this.state,
            dataMask: {
                ...dataMask,
                facilityCodeBitsInfo: {
                    startBit: startBit,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    onCardIdStartBitBlur(e: any) {
        const { dataMask } = this.state;
        let startBit = e.target.value || 0;
        let endBit = startBit == 0 ? 0 : +startBit > dataMask.cardDetailsBitsInfo.endBit ? startBit : dataMask.cardDetailsBitsInfo.endBit;

        this.setState({
            ...this.state,
            dataMask: {
                ...dataMask,
                cardDetailsBitsInfo: {
                    startBit: startBit,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    onCardIdEndBitBlur(e: any) {
        const { dataMask } = this.state;
        let endBit = e.target.value || 0;
        let startBit = endBit == 0 ? 0 : +endBit < dataMask.cardDetailsBitsInfo.startBit ? endBit : dataMask.cardDetailsBitsInfo.startBit;

        this.setState({
            ...this.state,
            dataMask: {
                ...dataMask,
                cardDetailsBitsInfo: {
                    startBit: startBit,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    onIssueCodeStartBitBlur(e: any) {
        const { dataMask } = this.state;
        let startBit = e.target.value || 0;
        let endBit = startBit == 0 ? 0 : +startBit > dataMask.issueCodeBitsInfo.endBit ? startBit : dataMask.issueCodeBitsInfo.endBit;

        this.setState({
            ...this.state,
            dataMask: {
                ...dataMask,
                issueCodeBitsInfo: {
                    startBit: startBit,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    onIssueCodeEndBitBlur(e: any) {
        const { dataMask } = this.state;
        let endBit = e.target.value || 0;
        let startBit = endBit == 0 ? 0 : +endBit < dataMask.issueCodeBitsInfo.startBit ? endBit : dataMask.issueCodeBitsInfo.startBit;

        this.setState({
            ...this.state,
            dataMask: {
                ...dataMask,
                issueCodeBitsInfo: {
                    startBit: startBit,
                    endBit: endBit
                }
            },
            isDirty: true
        });
    }

    //#endregion

    //#endregion

    //#endregion

    //#region Validations

    areRequiredFieldsEmpty(dataMask: DataMaskConfig) {
        if (dataMask.sourceType == DataMaskSources.NotApplicable)
            return false;

        return !dataMask.sourceType || !dataMask.name || !dataMask.cardType ||
            !dataMask.totalBits || !dataMask.facilityCode;
    }

    areRequiredBitsEmpty(dataMask: DataMaskConfig) {
        if (dataMask.sourceType == DataMaskSources.NotApplicable)
            return false;

        return !dataMask.cardDetailsBitsInfo.startBit || !dataMask.cardDetailsBitsInfo.endBit;
    }

    areBitsOverlapping(dataMask: DataMaskConfig) {
        if (dataMask.sourceType == DataMaskSources.NotApplicable ||
            (dataMask.facilityCodeBitsInfo.startBit == 0 && dataMask.facilityCodeBitsInfo.endBit == 0 &&
                dataMask.issueCodeBitsInfo.startBit == 0 && dataMask.issueCodeBitsInfo.endBit == 0))
            return false;

        return (
            (+dataMask.facilityCodeBitsInfo.startBit <= +dataMask.cardDetailsBitsInfo.startBit && +dataMask.facilityCodeBitsInfo.endBit >= +dataMask.cardDetailsBitsInfo.startBit) ||
            (+dataMask.facilityCodeBitsInfo.startBit <= +dataMask.cardDetailsBitsInfo.endBit && +dataMask.facilityCodeBitsInfo.endBit >= +dataMask.cardDetailsBitsInfo.endBit) ||
            (+dataMask.facilityCodeBitsInfo.startBit >= +dataMask.cardDetailsBitsInfo.startBit && +dataMask.facilityCodeBitsInfo.endBit <= +dataMask.cardDetailsBitsInfo.endBit) ||
            (+dataMask.cardDetailsBitsInfo.startBit <= +dataMask.issueCodeBitsInfo.startBit && +dataMask.cardDetailsBitsInfo.endBit >= +dataMask.issueCodeBitsInfo.startBit) ||
            (+dataMask.cardDetailsBitsInfo.startBit <= +dataMask.issueCodeBitsInfo.endBit && +dataMask.cardDetailsBitsInfo.endBit >= +dataMask.issueCodeBitsInfo.endBit) ||
            (+dataMask.cardDetailsBitsInfo.startBit >= +dataMask.issueCodeBitsInfo.startBit && +dataMask.cardDetailsBitsInfo.endBit <= +dataMask.issueCodeBitsInfo.endBit) ||
            (+dataMask.issueCodeBitsInfo.startBit <= +dataMask.facilityCodeBitsInfo.startBit && +dataMask.issueCodeBitsInfo.endBit >= +dataMask.facilityCodeBitsInfo.startBit) ||
            (+dataMask.issueCodeBitsInfo.startBit <= +dataMask.facilityCodeBitsInfo.endBit && +dataMask.issueCodeBitsInfo.endBit >= +dataMask.facilityCodeBitsInfo.endBit) ||
            (+dataMask.issueCodeBitsInfo.startBit >= +dataMask.facilityCodeBitsInfo.startBit && +dataMask.issueCodeBitsInfo.endBit <= +dataMask.facilityCodeBitsInfo.endBit)
        );
    }

    //#endregion    

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

    render() {
        const { parentType, integrationSystem } = this.props;
        const { dataMask, isDirty, showFieldErrors, showBitsError, customerExternalSystems, siteDataMask } = this.state;

        let dataMaskList: DataMaskConfig[] = [];

        if (dataMask.sourceType == DataMaskSources.ExternalSystem) {
            let externalSystem = customerExternalSystems.find(e => e.id == dataMask.sourceIdentifier);

            if (externalSystem && externalSystem.dataMasks && externalSystem.dataMasks.length > 0) {
                dataMaskList = externalSystem.dataMasks.filter(dm => dm.name != null);
            }
        }

        return (
            <Dialog className="datamask-config-dialog" width={750}>
                <div className="ty-modal-header">
                    <Row>
                        <Col>
                            <BackButton onClick={this.onBackClick} />
                            <SaveButton onClick={this.onSaveClick} disabled={!isDirty} />
                        </Col>
                    </Row>
                </div>
                <div className="ty-modal-body">
                    <Row className="pr-2">
                        <Col>
                            <Row className="mb-3">
                                <Col>
                                    <Row className="mb-2">
                                        <Col>
                                            <Label className="system-label pt-1 pl-3">{localise("TEXT_DATA_MASK_SOURCE")}:</Label>
                                        </Col>
                                        <Col>
                                            {
                                                dataMask.sourceType == DataMaskSources.IntegrationSystem ?
                                                    <Input value={lookupService.getText("LIST_INTEGRATION_SYSTEMS", dataMask.sourceIdentifier || "")} disabled />
                                                    :
                                                    <Input type="select" onChange={this.onDataMaskSourceChange} value={dataMask.sourceIdentifier} >
                                                        <option value="" className="d-none"></option>
                                                        {customerExternalSystems.map((e, key) =>
                                                            <option value={e.id} key={key} >{lookupService.getText("LIST_INTEGRATION_SYSTEMS", e.integrationSystem)}</option>)}
                                                        {(parentType == DataMaskParentTypes.Site || siteDataMask) && <option value="SITE">{localise("TEXT_SITE")}</option>}
                                                        {parentType == DataMaskParentTypes.Cabinet && <option value="CABINET">{localise("TEXT_CABINET")}</option>}
                                                        <option value="NOT_APPLICABLE">{localise("TEXT_NOT_APPLICABLE")}</option>
                                                    </Input>
                                            }
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col>
                                            <Label className="system-label pt-1 pl-3">{localise("TEXT_DATA_MASK_NAME")}:</Label>
                                        </Col>
                                        <Col>
                                            {
                                                dataMask.sourceType == DataMaskSources.ExternalSystem ?
                                                    <Input type="select" onChange={this.onDataMaskNameChange} value={dataMask.id}>
                                                        <option value="" className="d-none"></option>
                                                        {
                                                            dataMaskList.map((dm, key) => <option value={dm.id} key={key}>{dm.name}</option>)
                                                        }
                                                    </Input> :
                                                    <Input value={dataMask.name} onChange={this.onDataMaskNameChange}
                                                        disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
                                            }
                                            {
                                                showFieldErrors && !dataMask.name &&
                                                <small className="text-danger">{localise('ERROR_FIELD_REQUIRED')}</small>
                                            }
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col>
                                            <Label className="system-label pt-1 pl-3">{localise("TEXT_CARD_TYPE")}:</Label>
                                        </Col>
                                        <Col>
                                            <Input value={dataMask.cardType} onChange={this.onCardTypeChange}
                                                disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                    (dataMask.sourceType == DataMaskSources.IntegrationSystem && integrationSystem != IntegrationSystems.Brivo && 
                                                        integrationSystem != IntegrationSystems.CCure) ||
                                                    dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                    (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
                                            {
                                                showFieldErrors && !dataMask.cardType && dataMask.sourceType != DataMaskSources.ExternalSystem &&
                                                <small className="text-danger">{localise('ERROR_FIELD_REQUIRED')}</small>
                                            }
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col>
                                            <Label className="system-label pt-1 pl-3">{localise("TEXT_TOTAL_BITS")}:</Label>
                                        </Col>
                                        <Col>
                                            <Input type="number" value={dataMask.totalBits} onChange={this.onTotalBitsChange}
                                                onKeyPress={checkNumericInput} onBlur={this.onTotalBitsBlur}
                                                disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                    dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                    (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
                                            {
                                                showFieldErrors && dataMask.totalBits == 0 && dataMask.sourceType != DataMaskSources.ExternalSystem &&
                                                <small className="text-danger">{localise("ERROR_DATA_MASK_LENGTH")}</small>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Label className="system-label pt-1 pl-3">{localise("TEXT_FACILITY_CODE")}:</Label>
                                        </Col>
                                        <Col>
                                            <Input value={dataMask.facilityCode} onChange={this.onFacilityCodeChange}
                                                disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                    (dataMask.sourceType == DataMaskSources.IntegrationSystem && integrationSystem != IntegrationSystems.Brivo && 
                                                        integrationSystem != IntegrationSystems.CCure) ||
                                                    dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                    (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
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
                                        <Col>
                                            {
                                                showBitsError &&
                                                <Row className="mb-2">
                                                    <Col className="pl-0">
                                                        <small className="text-danger">
                                                            {localise(
                                                                this.areRequiredBitsEmpty(dataMask) ? "ERROR_DATA_MASK_BITS_REQUIRED" :
                                                                    this.areBitsOverlapping(dataMask) ? "ERROR_DATA_MASK_BITS_OVERLAP" : "")}
                                                        </small>
                                                    </Col>
                                                </Row>
                                            }
                                            <Row>
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
                                                                <Col className="pt-1 pr-0">
                                                                    <Label>{localise("TEXT_START_BIT")}</Label>
                                                                </Col>
                                                                <Col className="pl-0">
                                                                    <Input className="data-mask-bit-input"
                                                                        value={dataMask.facilityCodeBitsInfo.startBit}
                                                                        type="number" onChange={this.onFacilityCodeStartBitChange}
                                                                        onKeyPress={checkNumericInput} onBlur={this.onFacilityCodeStartBitBlur}
                                                                        disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col className="pt-1 pr-0">
                                                                    <Label>{localise("TEXT_END_BIT")}</Label>
                                                                </Col>
                                                                <Col className="pl-0">
                                                                    <Input className="data-mask-bit-input"
                                                                        value={dataMask.facilityCodeBitsInfo.endBit}
                                                                        type="number" onChange={this.onFacilityCodeEndBitChange}
                                                                        onKeyPress={checkNumericInput} onBlur={this.onFacilityCodeEndBitBlur}
                                                                        disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
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
                                                                <Col className="pt-1 pr-0">
                                                                    <Label>{localise("TEXT_START_BIT")}</Label>
                                                                </Col>
                                                                <Col className="pl-0">
                                                                    <Input className="data-mask-bit-input"
                                                                        value={dataMask.cardDetailsBitsInfo.startBit}
                                                                        type="number" onChange={this.onCardIdStartBitChange} name="start-bit"
                                                                        onKeyPress={checkNumericInput} onBlur={this.onCardIdStartBitBlur}
                                                                        disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col className="pt-1 pr-0">
                                                                    <Label>{localise("TEXT_END_BIT")}</Label>
                                                                </Col>
                                                                <Col className="pl-0">
                                                                    <Input className="data-mask-bit-input"
                                                                        value={dataMask.cardDetailsBitsInfo.endBit}
                                                                        type="number" onChange={this.onCardIdEndBitChange}
                                                                        onKeyPress={checkNumericInput} onBlur={this.onCardIdEndBitBlur}
                                                                        disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
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
                                                                <Col className="pt-1 pr-0">
                                                                    <Label>{localise("TEXT_START_BIT")}</Label>
                                                                </Col>
                                                                <Col className="pl-0">
                                                                    <Input className="data-mask-bit-input"
                                                                        value={dataMask.issueCodeBitsInfo.startBit}
                                                                        type="number" onChange={this.onIssueCodeStartBitChange}
                                                                        onKeyPress={checkNumericInput} onBlur={this.onIssueCodeStartBitBlur}
                                                                        disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col className="pt-1 pr-0">
                                                                    <Label>{localise("TEXT_END_BIT")}</Label>
                                                                </Col>
                                                                <Col className="pl-0">
                                                                    <Input className="data-mask-bit-input"
                                                                        value={dataMask.issueCodeBitsInfo.endBit}
                                                                        type="number" onChange={this.onIssueCodeEndBitChange}
                                                                        onKeyPress={checkNumericInput} onBlur={this.onIssueCodeEndBitBlur}
                                                                        disabled={dataMask.sourceType == DataMaskSources.NotApplicable ||
                                                                            dataMask.sourceType == DataMaskSources.ExternalSystem ||
                                                                            (dataMask.sourceType == DataMaskSources.Site && parentType == DataMaskParentTypes.Cabinet)} />
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
                        </Col>
                    </Row>
                </div>
            </Dialog>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/DataMaskConfig/DataMaskConfigPopup.tsx