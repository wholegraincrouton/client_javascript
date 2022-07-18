import React from "react";
import { Button, Col, Input, Row } from "reactstrap";
import { ConfigurationGrid } from "src/modules/shared/components/ConfigurationGrid/ConfigurationGrid";
import { CountryList, CountryStateList } from "src/modules/shared/components/CountryLocationList";
import { DataMaskForm } from "src/modules/shared/components/DataMaskForm/DataMaskForm";
import FormFieldContent from "src/modules/shared/components/Form/FormFieldContent";
import { LocationField } from "src/modules/shared/components/LocationField/LocationField";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { WizardDialog } from "src/modules/shared/components/WizardDialog/WizardDialog";
import { DefaultLocation } from "src/modules/shared/constants/default.location.constants";
import { apiService, configService, confirmDialogService, customerService, localise, lookupService, notificationDialogService, permissionService } from "src/modules/shared/services";
import { CabinetConfiguration, DataMaskParentTypes, DataUpdateResult } from "src/modules/shared/types/dto";
import { Site } from "../../types/dto";
import "./site-wizard.css"

interface State {
    currentStep: number;
    isDirty: boolean;
    showErrorsForName: boolean;
    showErrorsFoCountry: boolean;
    showErrorsFoState: boolean;
    showErrorsForRemark: boolean;
    showErrorsForAddress: boolean;
    errorMsg: string;
    site: Site;
    showLocationPopup: boolean;
    showAdminConfigs: boolean;
    adminConfigs: CabinetConfiguration[];
    nonAdminConfigs: CabinetConfiguration[];
    showFieldErrors: boolean;
}

interface Props {
    closeDialog: () => void;
}

export class SiteWizard extends React.Component<Props, State> {
    nameInput = (props: any) => <Input {...props} maxLength={40} />
    map: any;

    constructor(props: Props) {
        super(props);

        let customer = customerService.getCurrentCustomerData();
        this.state = {
            currentStep: 1,
            isDirty: false,
            showErrorsForName: false,
            showErrorsFoCountry: false,
            showErrorsFoState: false,
            showErrorsForRemark: false,
            showErrorsForAddress: false,
            errorMsg: '',
            site: {
                id: '',
                customerId: customer!.id,
                name: '',
                location: {
                    address: DefaultLocation.Address,
                    latitude: DefaultLocation.Latitude,
                    longitude: DefaultLocation.Longitude
                },
                cabinetCount: 0,
                remark: '',
                isDefault: false,
                configurations: [],
                country: '',
                state: '',
            },
            showLocationPopup: false,
            showAdminConfigs: false,
            adminConfigs: [],
            nonAdminConfigs: [],
            showFieldErrors: false
        };


        this.onCancelClick = this.onCancelClick.bind(this);
        this.onBackClick = this.onBackClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.validate = this.validate.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
        this.onStateChange = this.onStateChange.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onAutomaticUpdatesIntervalChange = this.onAutomaticUpdatesIntervalChange.bind(this);
        this.onRemarkChange = this.onRemarkChange.bind(this);
        this.onLocationChange = this.onLocationChange.bind(this);
        this.onConfigsChange = this.onConfigsChange.bind(this);
        this.onAdminConfigsChange = this.onAdminConfigsChange.bind(this);
        this.toggleAdminConfigs = this.toggleAdminConfigs.bind(this);
        this.setConfigurations = this.setConfigurations.bind(this);
        this.onDataMaskChange = this.onDataMaskChange.bind(this);
        this.setErrorByMsg = this.setErrorByMsg.bind(this);
        this.dirtyPageHandler = this.dirtyPageHandler.bind(this);

        window.addEventListener("beforeunload", this.dirtyPageHandler);
    }
    componentDidMount() {
        this.setConfigurations();
    }

    dirtyPageHandler(e: any) {
        if (this.state.isDirty) {
            e.returnValue = "";
            return "";
        }
        return;
    }

    onCancelClick() {
        const { closeDialog } = this.props;
        const { isDirty } = this.state;

        if (isDirty) {
            confirmDialogService.showDialog("CONFIRMATION_WIZARD_UNSAVED_CHANGES", closeDialog);
        }
        else {
            closeDialog();
        }
    }

    onBackClick() {
        this.setState({
            ...this.state,
            currentStep: this.state.currentStep - 1,
        });
    }

    onNextClick() {
        let error = this.validate();

        if (!error) {
            this.setState({
                ...this.state,
                errorMsg: '',
                currentStep: this.state.currentStep + 1,
            });
        }
    }

    onSaveClick() {
        const { closeDialog } = this.props;
        let { site } = this.state;
        const error = this.validate();        

        if (!error) {
            apiService.post<DataUpdateResult>('site', undefined, site, [], true)
                .then((e: any) => {
                    closeDialog();
                    notificationDialogService.showDialog(
                        'CONFIRMATION_SAVE_SITE', () => { }, 'TEXT_NEW_SITE_CREATED');
                })
                .catch((e: any) => {
                    console.log(e);
                    notificationDialogService.showDialog(
                        e.response.data || 'TEXT_ERROR', () => { }, 'TEXT_ERROR');
                    this.setErrorByMsg(e.response.data);
                });
        }
    }

    getSteps() {
        const steps = [
            { label: localise('TEXT_DETAILS') },
            { label: localise('TEXT_ADDRESS') },
            { label: localise('TEXT_DEFAULT_SITE_CONFIGURATION') },
            { label: localise('TEXT_DATA_MASK') },
        ];

        return steps;
    }

    setConfigurations() {
        const excludedConfigs = lookupService.getList('LIST_EXCLUDED_CABINET_CONFIGURATIONS_KEYS');
        let configs: CabinetConfiguration[] = JSON.parse(configService.getConfigurationValue("DEFAULT_SITE_CONFIGURATIONS"));

        let adminConfigs = configs.filter(c => excludedConfigs.some(ec => ec.value == c.key));
        let nonAdminConfigs = configs.filter(c => !excludedConfigs.some(ec => ec.value == c.key));

        this.setState({
            ...this.state,
            showAdminConfigs: false,
            adminConfigs: adminConfigs,
            nonAdminConfigs: nonAdminConfigs,
            site: {
                ...this.state.site,
                configurations: [...nonAdminConfigs, ...adminConfigs]
            }
        });
    }

    getComponent(stepNumber: number) {
        const { errorMsg, showErrorsForName, showErrorsFoCountry, showErrorsFoState, showErrorsForRemark, site, showAdminConfigs, showFieldErrors, showErrorsForAddress } = this.state;
        const hasAdminPermissions = permissionService.isActionPermittedForCustomer("CONFIGURATION");

        switch (stepNumber) {
            case 1:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("REMARK_SITE_DETAILS")}</small>
                            </Col>
                            <Col md="auto">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <FormFieldContent labelKey="TEXT_SITE_NAME"
                            remarksKey="REMARK_SITE_NAME"
                            required={true}
                            inputComponent={this.nameInput}
                            meta={{ error: localise(errorMsg), touched: showErrorsForName, warning: undefined }}
                            input={{ onChange: this.onNameChange, value: site.name }} />
                        <FormFieldContent remarksKey="REMARK_COUNTRY"
                            labelKey="TEXT_COUNTRY"
                            required={true}
                            inputComponent={(props: any) => <CountryList {...props} allowAny={false} />}
                            meta={{ error: localise(errorMsg), touched: showErrorsFoCountry, warning: undefined }}
                            input={{ onChange: this.onCountryChange, value: site.country }}
                        />
                        <FormFieldContent remarksKey="REMARK_STATE"
                            labelKey="TEXT_STATE"
                            required={true}
                            inputComponent={(props: any) => <CountryStateList {...props}
                                selectedCountry={site.country} />}
                            disabled={site.country == '' || site.country == null}
                            meta={{ error: localise(errorMsg), touched: showErrorsFoState, warning: undefined }}
                            input={{ onChange: this.onStateChange, value: site.state }} />
                        <FormFieldContent labelKey="TEXT_AUTOMATIC_UPDATES_INTERVAL"
                            remarksKey="REMARK_AUTOMATIC_UPDATES_INTERVAL"
                            inputComponent={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_AUTOMATIC_UPDATE_INTERVALS"
                                    allowBlank={true} textBlank="N/A" />}
                            meta={{ error: '', touched: false, warning: undefined }}
                            input={{ onChange: this.onAutomaticUpdatesIntervalChange, value: site.automaticUpdatesInterval }} />
                        <FormFieldContent remarksKey="REMARK_SITE_REMARK"
                            labelKey="TEXT_REMARK"
                            required={true}
                            inputComponent={Input}
                            meta={{ error: localise(errorMsg), touched: showErrorsForRemark, warning: undefined }}
                            input={{ onChange: this.onRemarkChange, value: site.remark }} />
                    </>
                );
            case 2:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("REMARK_ADDRESS_DETAILS")}</small>
                            </Col>
                            <Col md="auto">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {
                                    showErrorsForAddress && errorMsg &&
                                    <small className="text-danger">{localise(errorMsg)}</small>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormFieldContent remarksKey="REMARK_SITE_LOCATION"
                                    labelKey="TEXT_ADDRESS"
                                    inputComponent={(props: any) =>
                                        <>
                                            <Row>
                                                <Col>
                                                    <LocationField locationProps={site.location} onChanges={this.onLocationChange} />
                                                </Col>
                                            </Row>
                                        </>
                                    }
                                />
                            </Col>
                        </Row>

                    </>
                );
            case 3:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("REMARK_SITE_CONFIGURATION")}</small>
                            </Col>
                        </Row>
                        <ConfigurationGrid configurations={site.configurations} onChange={this.onConfigsChange} isPermittedToEdit={true}
                            lookupkey="LIST_CABINET_CONFIGURATION_KEYS" excludedLookupKey="LIST_EXCLUDED_CABINET_CONFIGURATIONS_KEYS" />
                        {
                            hasAdminPermissions &&
                            <>
                                <Row className={`mt-2 ${showAdminConfigs ? 'mb-2' : ''}`}>
                                    <Col align="right">
                                        <Button color="link" onClick={this.toggleAdminConfigs}>
                                            {localise(showAdminConfigs ? "BUTTON_HIDE_ADMIN_CONFIGURATIONS" : "BUTTON_SHOW_ADMIN_CONFIGURATIONS")}
                                            <i className={"fas " + (showAdminConfigs ? "fa-angle-up" : "fa-angle-down")} style={{ marginLeft: 10 }} />
                                        </Button>
                                    </Col>
                                </Row>
                                {
                                    showAdminConfigs &&
                                    <ConfigurationGrid configurations={site.configurations} isPermittedToEdit={true}
                                        onChange={this.onAdminConfigsChange} lookupkey="LIST_EXCLUDED_CABINET_CONFIGURATIONS_KEYS" />
                                }
                            </>
                        }
                    </>
                );
            case 4:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("REMARK_SITECABINETS_DATAMASK")}</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {
                                    showFieldErrors && errorMsg &&
                                    <small className="text-danger">{localise(errorMsg)}</small>
                                }
                            </Col>
                        </Row>
                        <DataMaskForm customerId={site.customerId} parentType={DataMaskParentTypes.Site}
                            onChange={this.onDataMaskChange} dataMask={site.dataMask}
                            showFieldErrors={showFieldErrors} isPermittedToEdit={true} />
                    </>
                );
            default:
                return <></>;
        }
    }

    validate() {
        const { site, currentStep } = this.state;

        let errorMsg = '';
        let showErrorsForName = false;
        let showErrorsFoCountry = false;
        let showErrorsFoState = false;
        let showErrorsForRemark = false;
        let showErrorsForAddress = false;
        let isError = false;
        let isDataMaskError = false;
        switch (currentStep) {
            case 1:
                if (!site.name) {
                    errorMsg = 'ERROR_NAME_REQUIRED';
                    showErrorsForName = true;
                    isError = true;
                } else if (!site.country) {
                    errorMsg = 'ERROR_COUNTRY_REQUIRED';
                    showErrorsFoCountry = true;
                    isError = true;
                } else if (!site.state) {
                    errorMsg = 'ERROR_STATE_REQUIRED';
                    showErrorsFoState = true;
                    isError = true;
                } else if (!site.remark) {
                    errorMsg = 'ERROR_REMARK_REQUIRED';
                    showErrorsForRemark = true;
                    isError = true;
                }
                break;
            case 2:
                if(!site.location || site.location && !site.location.address || site.location && !(site.location.latitude || site.location.longitude)) {
                    showErrorsForAddress = true;
                    errorMsg = 'ERROR_INVALID_ADDRESS';
                    isError = true;
                }
                break;
            case 4:
                if( site.dataMask && site.dataMask.status == "ACTIVE") {                 
                    if(!site.dataMask.name || !site.dataMask.cardType || !site.dataMask.facilityCode) {
                        isDataMaskError = true;
                        isError = true;
                    }
                }
                break;
            default:
                break;
        }

        this.setState({
            ...this.state,
            showErrorsForName: showErrorsForName,
            showErrorsFoCountry: showErrorsFoCountry,
            showErrorsFoState: showErrorsFoState,
            showErrorsForRemark: showErrorsForRemark,
            showErrorsForAddress: showErrorsForAddress,
            errorMsg: errorMsg,
            showFieldErrors: isDataMaskError
        });
        return isError;
    }

    setErrorByMsg(error: string) {        
        let showErrorsForName = false;
        let showErrorsFoCountry = false;
        let showErrorsFoState = false;
        let showErrorsForRemark = false;
        let showErrorsForAddress = false;
        let isDataMaskError = false;

        switch (error) {
            case 'ERROR_SITE_NAME_REQUIRED':
            case 'ERROR_DUPLICATE_SITE':
                showErrorsForName = true;
                break;
            case 'ERROR_COUNTRY_REQUIRED':
                showErrorsFoCountry = true;
                break;
            case 'ERROR_STATE_REQUIRED':
                showErrorsFoState = true;
                break;
            case 'ERROR_DESCRIPTION_REQUIRED':
                showErrorsForRemark = true;
                break;
            case 'ERROR_INVALID_COORDINATES':
                showErrorsForAddress = true;
                break;
            case 'ERROR_DUPLICATE_DATAMASK_NAME':
            case 'ERROR_DUPLICATE_DATAMASK_CARDTYPE':
                isDataMaskError = true;
                break;
            default:
                showErrorsForName = false;
                showErrorsFoCountry = false;
                showErrorsFoState = false;
                showErrorsForRemark = false;
                showErrorsForAddress = false;
                isDataMaskError = false;
        }

        this.setState({
            ...this.state,
            showErrorsForName: showErrorsForName,
            showErrorsFoCountry: showErrorsFoCountry,
            showErrorsFoState: showErrorsFoState,
            showErrorsForRemark: showErrorsForRemark,
            showErrorsForAddress: showErrorsForAddress,
            showFieldErrors: isDataMaskError,
            errorMsg: error
        })

    }

    render() {
        const { currentStep } = this.state;

        return (
            <WizardDialog titleKey={localise('TEXT_NEW_SITE')} className={"site-wizard"}
                stepCount={4} steps={this.getSteps()} currentStep={currentStep}
                component={this.getComponent(currentStep)}
                onBackClick={this.onBackClick} onNextClick={this.onNextClick}
                onCancelClick={this.onCancelClick} onSaveClick={this.onSaveClick} />
        );
    }

    onNameChange(value: any) {
        this.setState({ ...this.state, isDirty: true, site: { ...this.state.site, name: value } });
    }

    onCountryChange(value: any) {
        this.setState({ ...this.state, isDirty: true, site: { ...this.state.site, country: value } });
    }

    onStateChange(value: any) {
        this.setState({ ...this.state, isDirty: true, site: { ...this.state.site, state: value } });
    }

    onAutomaticUpdatesIntervalChange(value: any) {
        this.setState({ ...this.state, isDirty: true, site: { ...this.state.site, automaticUpdatesInterval: value } });
    }

    onRemarkChange(value: any) {
        this.setState({ ...this.state, isDirty: true, site: { ...this.state.site, remark: value } });
    }

    onLocationChange(value: any) {        
        this.setState({ ...this.state, isDirty: true, site: { ...this.state.site, location: value } });
    }

    onConfigsChange(value: any) {
        const { adminConfigs } = this.state;
        this.setState({ ...this.state, isDirty: true, nonAdminConfigs: value, site: { ...this.state.site, configurations: [...value, ...adminConfigs] } });
    }

    onAdminConfigsChange(value: any) {
        const { nonAdminConfigs } = this.state;
        this.setState({ ...this.state, isDirty: true, adminConfigs: value, site: { ...this.state.site, configurations: [...nonAdminConfigs, ...value] } });
    }

    toggleAdminConfigs() {
        this.setState({ ...this.state, isDirty: true, showAdminConfigs: !this.state.showAdminConfigs });
    }

    onDataMaskChange(value: any) {
        this.setState({ ...this.state, isDirty: true, site: { ...this.state.site, dataMask: value } })
    }
}



// WEBPACK FOOTER //
// ./src/modules/sites/components/SiteWizard/SiteWizard.tsx