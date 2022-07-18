import * as React from 'react';
import { DetailPage, DetailFormBodyComponent, DetailFormProps, DetailPageContainer } from 'src/modules/shared/components/DetailPage';
import { FormField, FormAuditField } from 'src/modules/shared/components/Form';
import { LookupDropDown } from 'src/modules/shared/components/LookupDropDown/LookupDropDown';
import { contextService, localise, lookupService, configService, apiService, permissionService } from 'src/modules/shared/services';
import {
    ExternalSystem, IntegrationStatus, UserSynchronisationSelection, UserFieldMap, TempUserFieldMap,
    TempEventDetail, TempExternalSystemConfiguration, ExternalSystemConfiguration, AntiTailgatingStatus, complexIntegrations, IntegrationSystems
} from '../../types/dto';
import { Input, Label, Row, Col, Alert } from 'reactstrap';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { UserImportConfiguration } from './UserImportConfiguration';
import { SubmissionError } from 'redux-form';
import { EventExportConfiguration } from './EventExportConfiguration';
import "./external-system-detail.css"
import * as moment from 'moment';
import { MiddlewareConfiguration } from './MiddlewareConfiguration';
import { DataMaskConfiguration } from './DataMaskConfiguration';
import { AntiTailgatingConfiguration } from './AntiTailgatingConfiguration';
import { CabinetDetail, TempSiteDetail } from 'src/modules/cabinet/types/dto';
import { DefaultDateTimeFormats } from 'src/modules/shared/constants/datetime.constants';
import { AccessGroupConfiguration } from './AccessGroupConfiguration';
import { DetailFormHeaderComponent } from 'src/modules/shared/components/DetailPage/DetailForm';
import { ActionButton } from 'src/modules/shared/components/ActionButtons/ActionButtons';
import { EventLogPopup } from './EventLogPopup';
import { SineSettingsTab } from './SineSettingsTab';
import { RoleMappingsTab } from './RoleMappingsTab';
import { DeviceMappingsTab } from './DeviceMappingsTab';

class ExternalSystemDetails extends DetailPage<ExternalSystem> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    detailFormHeader: DetailFormHeaderComponent = (props: DetailFormProps) => {
        const { item } = props;

        return (complexIntegrations.includes(item.integrationSystem)) ? <ActionButton key="importbtn" textKey="BUTTON_DOWNLOAD" color="secondary"
            onClick={this.downloadMiddleware} title={localise('REMARK_DOWNLOAD')} /> : <></>;
    };

    listPagePath: string = "/externalsystems/externalsystemmanagement";

    downloadMiddleware() {
        apiService.get("externalsystem", "GetMiddlewareBlobUrl")
            .then((url: string) => {
                window.location.href = url;
            });
    }

    validateItem(item: ExternalSystem) {
        return {};
    }

    objectToFormValues(item: ExternalSystem) {
        const values = {
            ...item,
            webhookURL: item.integrationSystem == IntegrationSystems.Sine ? configService.getConfigurationValue('URL_SINE_WEBHOOK') : '',
            accessGrantURL: item.integrationSystem == IntegrationSystems.AzureAD ?
                `https://login.microsoftonline.com/${item.externalId}/v2.0/adminconsent?client_id=${appConfig.activeDirectoryClientId}&scope=https://graph.microsoft.com/.default` : '',
            timeZone: item.timeZone || 'AUS Eastern Standard Time',
            integrationStatus: item.integrationStatus || IntegrationStatus.Active,
            userSynchronisationSelection: item.userSynchronisationSelection || UserSynchronisationSelection.IntervalBased,
            tempUserFieldMappingList: undefined,
            tempExternalSystemConfigurations: undefined
        };

        values.syncInterval = values.userSynchronisationSelection == UserSynchronisationSelection.IntervalBased ?
            (!item.syncInterval || item.syncInterval == '') ? "00:00:10" : item.syncInterval : '';

        return values;
    }

    beforeSave(item: ExternalSystem): boolean {
        let error = this.validate(item);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }

        if (complexIntegrations.includes(item.integrationSystem)) {
            if (item.tempUserFieldMappingList) {
                item.userFieldMappingList = item.id == '' ? [] : this.getSavingUserFieldMappingsList(item.tempUserFieldMappingList);
            }

            if (item.tempExternalSystemConfigurations) {
                item.externalSystemConfigurations = item.id == '' ? [] :
                    this.getSavingConfigMappingsList(item.tempExternalSystemConfigurations);
            }

            if (item.tempDataMasks) {
                item.dataMasks = item.id == '' ? [] : item.tempDataMasks;
            }

            if (item.tempExportEventDetails) {
                item.exportEvents = item.tempExportEventDetails.map(i => {
                    return i.eventKey
                })
            }

            if (item.tempSiteDetails) {
                item.antiTailgatingItemset = this.getSavingAntiTailgatingDetails(item.tempSiteDetails);
                delete item.tempSiteDetails;
            }

            if (item.id == '') {
                item.userSynchronisationSelection = undefined;
                item.syncInterval = undefined;
                item.scheduleDay = undefined;
                item.scheduleTime = undefined;
                item.exportEventFromDate = moment(Date()).format(DefaultDateTimeFormats.DateTimeFormat);
            }

            if (item.id != '') {
                item.exportEventFromDate = item.tempExportEventFromDate ? moment(item.tempExportEventFromDate).format(DefaultDateTimeFormats.DateTimeFormat)
                    : item.exportEventFromDate;
                item.exportEvents = item.exportEvents ? item.exportEvents :
                    lookupService.getList("LIST_CABINET_HIGH_PRIORITY_EVENTS").map((item) => {
                        return item.value || "";
                    })
            }
        }
        else if (item.integrationSystem == IntegrationSystems.Brivo) {
            if (item.tempExternalSystemConfigurations) {
                item.externalSystemConfigurations = item.id == '' ? [] :
                    this.getSavingConfigMappingsList(item.tempExternalSystemConfigurations);
            }

            if (item.tempDataMasks) {
                item.dataMasks = item.id == '' ? [] : item.tempDataMasks;
            }
        }

        if (item.integrationSystem == IntegrationSystems.Gallagher8 || item.integrationSystem == IntegrationSystems.Brivo) {
            if (item.tempDeviceMappings) {
                item.deviceMappings = item.id == '' ? [] : item.tempDeviceMappings;
                item.tempDeviceMappings = undefined;
            }
        }

        return true;
    }

    getSavingUserFieldMappingsList(mappings: TempUserFieldMap[]) {
        let newList: UserFieldMap[] = [];
        mappings.forEach(mapping => {
            if (mapping.isSelected) {
                let fieldMapping: UserFieldMap = { systemField: mapping.systemField, thirdPartyField: mapping.thirdPartyField || '' };
                newList.push(fieldMapping);
            }
        });
        return newList;
    }

    getSavingConfigMappingsList(configs: TempExternalSystemConfiguration[]) {
        let newList: ExternalSystemConfiguration[] = [];
        configs.forEach(config => {
            if (config.value) {
                let savingConfig: ExternalSystemConfiguration = { key: config.key, value: config.value };
                newList.push(savingConfig);
            }
        });
        return newList;
    }

    getSavingAntiTailgatingDetails(tempSiteDetails: TempSiteDetail[]) {
        let newCabinetDetailsList: CabinetDetail[] = []
        tempSiteDetails.forEach(site => {
            site.isSelected && site.cabinets.forEach((cabinet) => {
                if (cabinet.isSelected) {
                    let newCabinetDetail: CabinetDetail = {
                        cabinetId: cabinet.cabinetId,
                        itemIndexes: []
                    };

                    cabinet.items && cabinet.items.forEach(item => {
                        item.isSelected && newCabinetDetail.itemIndexes.push(item.number);
                    });

                    newCabinetDetail.itemIndexes.length > 0 && newCabinetDetailsList.push(newCabinetDetail); // If atleast one item selected add to the list
                }
            });
        });
        return newCabinetDetailsList;
    }

    validate(externalSystem: ExternalSystem) {
        if (externalSystem.id != '') {
            if (complexIntegrations.includes(externalSystem.integrationSystem)) {
                if (
                    (externalSystem.tempExternalSystemConfigurations &&
                        (externalSystem.tempExternalSystemConfigurations.length == 0 ||
                            externalSystem.tempExternalSystemConfigurations.some(c => c.value == undefined || c.value == ''))) ||
                    (!externalSystem.tempExternalSystemConfigurations &&
                        (!externalSystem.externalSystemConfigurations || externalSystem.externalSystemConfigurations.length == 0))) {
                    return 'MIDDLEWARE_TAB:ERROR_EXTERNAL_SYSTEM_CONFIGURATIONS_REQUIRED';
                }
                else if (((externalSystem.tempDataMasks == undefined && (externalSystem.dataMasks && externalSystem.dataMasks.some(dm => (dm.isSelected)))) ||
                    (externalSystem.tempDataMasks && externalSystem.tempDataMasks.some(dm => (dm.isSelected))))
                    && (externalSystem.tempUserFieldMappingList == undefined && (externalSystem.userFieldMappingList && !externalSystem.userFieldMappingList.find(m => m.systemField == "BiometricData")) ||
                        (externalSystem.tempUserFieldMappingList && externalSystem.tempUserFieldMappingList.some(m => m.systemField == "BiometricData" && m.isSelected == false)))) {
                    return 'USER_IMPORT_TAB:ERROR_SELECT_CARD_DETAILS';
                }
                else if (externalSystem.tempExportEventFromDate &&
                    new Date(externalSystem.tempExportEventFromDate).getTime() < new Date().getTime()) {
                    return 'EVENT_EXPORT_TAB:ERROR_PAST_DATES_NOT_ALLOWED';
                }
                else if (externalSystem.userSynchronisationSelection == UserSynchronisationSelection.ScheduleBased &&
                    (externalSystem.scheduleTime == undefined || externalSystem.scheduleTime == '' || externalSystem.scheduleTime == 'Invalid date')) {
                    return 'USER_IMPORT_TAB:ERROR_SELECT_SCHEDULE_TIME';
                }
                else if (
                    (externalSystem.userFieldMappingList == undefined && // For first update
                        (externalSystem.tempUserFieldMappingList == undefined || externalSystem.tempUserFieldMappingList.length == 0)) ||
                    (externalSystem.userFieldMappingList != undefined &&
                        (externalSystem.tempUserFieldMappingList != undefined && externalSystem.tempUserFieldMappingList.length == 0))) { // After first update without visiting the tab
                    return 'USER_IMPORT_TAB:ERROR_SELECT_VALUE_FOR_EXTERNAL_SYSTEM_FIELD';
                }
                else if (externalSystem.tempUserFieldMappingList) { // When tab visited
                    for (let i = 0; i < externalSystem.tempUserFieldMappingList.length; i++) {
                        let mapping = externalSystem.tempUserFieldMappingList[i];

                        if (mapping.isMandatory && !mapping.isSelected)
                            return 'USER_IMPORT_TAB:ERROR_SELECT_MANDATORY_FIELDS';
                        else if (mapping.isSelected && (!mapping.thirdPartyField || mapping.thirdPartyField == ''))
                            return 'USER_IMPORT_TAB:ERROR_SELECT_VALUE_FOR_EXTERNAL_SYSTEM_FIELD';
                    }
                }
                else if (externalSystem.antiTailgatingStatus == AntiTailgatingStatus.Active) {
                    if (!externalSystem.antiTailgatingItemsetName) {
                        return "ANTI_TAILGATING_TAB:ERROR_ANTI_TAILGATING_ITEM_SET_NAME_REQUIRED";
                    }
                    else if (externalSystem.tempSiteDetails) {
                        if (!externalSystem.tempSiteDetails.some(s => s.isSelected)) {
                            return 'ANTI_TAILGATING_TAB:ERROR_PLEASE_SELECT_SITE_CABINET_ITEMS';
                        }

                        for (let i = 0; i < externalSystem.tempSiteDetails.length; i++) {
                            let group = externalSystem.tempSiteDetails[i];

                            if (group.isSelected) {
                                if (!group.cabinets.some(c => c.isSelected)) {
                                    return 'ANTI_TAILGATING_TAB:ERROR_PLEASE_SELECT_CABINET_FOR_SELECTED_SITE';
                                }
                                else {
                                    for (let j = 0; j < group.cabinets.length; j++) {
                                        let cabinet = group.cabinets[j];

                                        if (cabinet.isSelected) {
                                            if (!cabinet.items || !cabinet.items.some(i => i.isSelected)) {
                                                return 'ANTI_TAILGATING_TAB:ERROR_PLEASE_SELECT_ITEMS_FOR_SELECTED_CABINET';
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else if (externalSystem.integrationSystem == IntegrationSystems.Sine) {
                if (!externalSystem.alertUsers || externalSystem.alertUsers.length == 0) {
                    return 'SETTINGS_TAB:ERROR_INTEGRATION_ALERT_USERS_REQUIRED';
                }
            }
            else if (externalSystem.integrationSystem == IntegrationSystems.AzureAD) {
                if (externalSystem.userGroups && externalSystem.userGroups.some(r => externalSystem.selectedUserGroups.includes(r.id) && !r.role)) {
                    return 'ROLE_MAPPINGS_TAB:ERROR_ROLE_MAPPINGS_REQUIRED';
                }
            }
            else if (externalSystem.integrationSystem == IntegrationSystems.Brivo) {
                if (
                    (externalSystem.tempExternalSystemConfigurations &&
                        (externalSystem.tempExternalSystemConfigurations.length == 0 ||
                            externalSystem.tempExternalSystemConfigurations.some(c => c.value == undefined || c.value == ''))) ||
                    (!externalSystem.tempExternalSystemConfigurations &&
                        (!externalSystem.externalSystemConfigurations || externalSystem.externalSystemConfigurations.length == 0))) {
                    return 'MIDDLEWARE_TAB:ERROR_EXTERNAL_SYSTEM_CONFIGURATIONS_REQUIRED';
                }
            }
        }
        return null;
    }

    hideDescriptionHeader() {
        return true;
    }
}

interface LocalState {
    integrationStatus: string;
    selectedTab: number;
    integrationSystem: string;
    showEventLogPopup: boolean;
}

class FormBody extends React.Component<DetailFormProps, LocalState> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onSelectTab = this.onSelectTab.bind(this);
        this.onIntegrationSystemChange = this.onIntegrationSystemChange.bind(this);
        this.onIntegrationStatusChange = this.onIntegrationStatusChange.bind(this);
        this.onExportFromChange = this.onExportFromChange.bind(this);
        this.onEventDataChange = this.onEventDataChange.bind(this);
        this.getBaseDetailTab = this.getBaseDetailTab.bind(this);
        this.toggleEventLogPopup = this.toggleEventLogPopup.bind(this);

        this.state = {
            integrationStatus: (props.initialValues as any).integrationStatus,
            selectedTab: 0,
            integrationSystem: (props.initialValues as any).integrationSystem,
            showEventLogPopup: false
        }
    }

    onSelectTab(e: any) {
        this.setState({ ...this.state, selectedTab: e.selected })
    }

    onIntegrationSystemChange(event: any, inputProps: any) {
        this.setState({ integrationSystem: event.target.value });
        inputProps.onChange(event);
    }

    onIntegrationStatusChange(event: any, inputProps: any) {
        this.setState({ integrationStatus: event.target.value });
        inputProps.onChange(event);
    }

    getTabHeader(titleKey: string, hasError: boolean = false, isDisabled: boolean = false) {
        return (
            <>
                <Label className="mt-1 mb-1" title={hasError ? localise("TEXT_ERROR_VERIFY_DATA_TAB") :
                    isDisabled ? localise("TEXT_PLEASE_SAVE_TO_PROCEED") : ""}>
                    {localise(titleKey)} {hasError && <i className="fas fa-exclamation-circle error-tab-icon"></i>}
                </Label>
            </>
        );
    }

    getErrorAlertRow(errorMsg: string) {
        return (
            <Row className="mt-2 mb-2">
                <Col>
                    <Alert className="mb-0" color="danger">
                        <small className="text-danger">{localise(errorMsg)}</small>
                    </Alert>
                </Col>
            </Row>
        );
    }

    onExportFromChange(date: string) {
        this.props.change("tempExportEventFromDate", date);
    }

    onEventDataChange(eventData: TempEventDetail[]) {
        this.props.change("tempExportEventDetails", eventData);
        this.props.change("exportEventDetails", eventData);
    }

    goToSwagger() {
        let url = configService.getConfigurationValue('URL_REST_API_SWAGGER');
        let win = window.open(url, '_blank');
        win && win.focus();
    }

    toggleEventLogPopup() {
        this.setState({ ...this.state, showEventLogPopup: !this.state.showEventLogPopup });
    }

    getBaseDetailTab(formProps: any) {
        const { item, isNew, initialValues } = this.props;
        const { integrationSystem, integrationStatus, showEventLogPopup } = this.state;
        const provisioningId = (this.props.initialValues as ExternalSystem).provisioningKey;
        const errorTab = formProps.error && formProps.error.split(":")[0];
        const errorMsg = formProps.error && formProps.error.split(":")[1];
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <TabStripTab title={this.getTabHeader("TEXT_EXTERNAL_SYSTEM", errorTab == "DETAIL_TAB")}>
                {errorTab == "DETAIL_TAB" && this.getErrorAlertRow(errorMsg)}
                <Row className="mt-2 mb-3">
                    <Col>
                        <small className="text-muted"> {localise("TEXT_PAGE_DESCRIPTION")} </small>
                    </Col>
                    <Col md="auto">
                        <small className="text-muted"> {localise('TEXT_REQUIRED_FIELD')} </small>
                    </Col>
                </Row>
                <Row className="external-system-details-form">
                    <Col>
                        <FormField name="integrationSystem" required={true} remarksKey="REMARK_INTEGRATION_SYSTEM" labelKey="TEXT_INTEGRATION_SYSTEM"
                            disabled={!formProps.isNew} component={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_INTEGRATION_SYSTEMS" onChange={(e: any) => this.onIntegrationSystemChange(e, props)}
                                    disabled={!isPermittedToEdit} />} />
                        {
                            integrationSystem == IntegrationSystems.Generic &&
                            <Row className="mb-3">
                                <Col>
                                    <ActionButton textKey="BUTTON_REST_API" title={localise('REMARK_REST_API')}
                                        color="secondary" onClick={this.goToSwagger} isPermissionAllowed={isPermittedToEdit} />
                                </Col>
                            </Row>
                        }
                        {
                            integrationSystem == IntegrationSystems.AzureAD &&
                            <>
                                <FormField name="externalId" remarksKey="REMARK_TENANT_ID" labelKey="TEXT_TENANT_ID"
                                    required={integrationSystem == IntegrationSystems.AzureAD} component={Input} disabled={!isNew} />
                                {
                                    !isNew &&
                                    <>
                                        <FormField name="accessGrantURL" remarksKey="REMARK_ACCESS_GRANT_URL" labelKey="TEXT_ACCESS_GRANT_URL"
                                            component={Input} disabled={true} showCopyButton={true} copyValue={(initialValues as ExternalSystem).accessGrantURL} />
                                    </>
                                }
                            </>
                        }
                        {
                            provisioningId && integrationSystem != IntegrationSystems.AzureAD &&
                            <Row className="mb-2">
                                <Col>
                                    <Row>
                                        <Col>
                                            <Label className="system-label">{localise('TEXT_PROVISIONING_KEY')}*</Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <span className="badge badge-secondary font-weight-normal provisioning-key-label">{provisioningId}</span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <small className="text-muted">{localise('REMARK_PROVISIONING_KEY')}</small>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        }
                        {
                            !isNew && integrationSystem == IntegrationSystems.Sine &&
                            <FormField name="webhookURL" remarksKey="REMARK_WEBHOOK_URL_SINE" labelKey="TEXT_WEBHOOK_URL"
                                component={Input} disabled={true} showCopyButton={true} copyValue={(initialValues as ExternalSystem).webhookURL} />
                        }
                        <FormField name="timeZone" required={true} remarksKey="REMARK_TIMEZONE" labelKey="TEXT_TIMEZONE" disabled={!isPermittedToEdit}
                            component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_TIMEZONE" />} />
                        <FormField name="description" required={true} remarksKey="REMARK_DESCRIPTION" labelKey="TEXT_DESCRIPTION" disabled={!isPermittedToEdit}
                            component={Input} />
                        <FormField name="integrationStatus" required={true} remarksKey="REMARK_INTEGRATION_STATUS" labelKey="TEXT_INTEGRATION_STATUS"
                            component={(props: any) => formProps.isNew ?
                                <LookupDropDown {...props} lookupKey="LIST_INTEGRATION_STATUS" value={integrationStatus} disabled={true}
                                    onChange={(e: any) => this.onIntegrationStatusChange(e, props)} /> :
                                <LookupDropDown {...props} lookupKey="LIST_INTEGRATION_STATUS" value={integrationStatus} disabled={!isPermittedToEdit}
                                    onChange={(e: any) => this.onIntegrationStatusChange(e, props)} />} />
                        {
                            !isNew &&
                            <Row className="mb-2">
                                <Col>
                                    <Row>
                                        <Col>
                                            <ActionButton textKey="BUTTON_EVENT_LOG" title={localise('REMARK_EXCHANGE_EVENT_LOG')}
                                                color="secondary" onClick={this.toggleEventLogPopup} />
                                            {
                                                showEventLogPopup &&
                                                <EventLogPopup middlewareId={item.id} onBackClick={this.toggleEventLogPopup} />
                                            }
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        }
                        <FormAuditField updatedOnUtc={formProps.item.updatedOnUtc} updatedByName={formProps.item.updatedByName} />
                    </Col>
                </Row>
            </TabStripTab>
        );
    }

    getUsersTabKey(integrationSystem: string) {
        switch (integrationSystem) {
            case IntegrationSystems.Gallagher8:
            case IntegrationSystems.Genetec:
                return 'TEXT_CARDHOLDERS';
            case IntegrationSystems.CCure:
                return 'TEXT_PERSONNEL';
            case IntegrationSystems.C4:
                return 'TEXT_PERSONS';
            default:
                return 'TEXT_USERS';
        }
    }

    getGroupsTabKey(integrationSystem: string) {
        switch (integrationSystem) {
            case IntegrationSystems.Genetec:
                return 'TEXT_CARDHOLDER_GROUPS';
            case IntegrationSystems.Integriti:
                return 'TEXT_PERMISSION_GROUPS';
            case IntegrationSystems.Brivo:
                return 'TEXT_GROUPS';
            case IntegrationSystems.CCure:
                return 'TEXT_CLEARANCE_GROUPS';
            default:
                return 'TEXT_ACCESSGROUPS';
        }
    }

    getSettingsTabKey(integrationSystem: string) {
        switch (integrationSystem) {
            case IntegrationSystems.Gallagher8:
            case IntegrationSystems.Genetec:
            case IntegrationSystems.Integriti:
            case IntegrationSystems.CCure:
            case IntegrationSystems.C4:
                return `${configService.getConfigurationValue("PRODUCT_NAME")} ${localise("TEXT_EXCHANGE")}`;
            default:
                return 'TEXT_SETTINGS';
        }
    }

    getTabCount(integrationSystem: string) {
        switch (integrationSystem) {
            case IntegrationSystems.Gallagher8:
                return 8;
            case IntegrationSystems.Genetec:
                return 7;
            case IntegrationSystems.Integriti:
            case IntegrationSystems.CCure:
                return 6;
            case IntegrationSystems.Brivo:
                return 5;
            case IntegrationSystems.C4:
                return 4;
            case IntegrationSystems.AzureAD:
            case IntegrationSystems.Sine:
                return 2;
            default:
                return 1;
        }
    }

    render() {
        const { props: formProps } = this;
        const { selectedTab, integrationSystem } = this.state;
        const errorTab = formProps.error && formProps.error.split(":")[0];
        const errorMsg = formProps.error && formProps.error.split(":")[1];

        const usersKey = this.getUsersTabKey(integrationSystem);
        const userGroupsKey = this.getGroupsTabKey(integrationSystem);
        const settingsKey = this.getSettingsTabKey(integrationSystem);
        const tabCount = this.getTabCount(integrationSystem);

        return (
            <div className="external-systems-tabs">
                <TabStrip selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={true} className={`tab-count-${tabCount}`}>
                    {this.getBaseDetailTab(formProps)}
                    {
                        complexIntegrations.includes(integrationSystem) &&
                        <TabStripTab title={this.getTabHeader(usersKey, errorTab == "USER_IMPORT_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            {errorTab == "USER_IMPORT_TAB" && this.getErrorAlertRow(errorMsg)}
                            <UserImportConfiguration {...formProps}
                                externalSystemId={formProps.item.id}
                                isDirty={formProps.dirty}
                                integrationStatus={formProps.item.integrationStatus}
                                integrationSystem={formProps.item.integrationSystem}
                                userFieldMappingList={formProps.item.userFieldMappingList || []} />
                        </TabStripTab>
                    }
                    {
                        ((complexIntegrations.includes(integrationSystem) && integrationSystem != IntegrationSystems.C4) || integrationSystem == IntegrationSystems.Brivo) &&
                        <TabStripTab title={this.getTabHeader(userGroupsKey, errorTab == "ACCESS_GROUP_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            <AccessGroupConfiguration {...formProps} />
                        </TabStripTab>
                    }
                    {
                        complexIntegrations.includes(integrationSystem) &&
                        <TabStripTab title={this.getTabHeader("TEXT_EVENTS", errorTab == "EVENT_EXPORT_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            {errorTab == "EVENT_EXPORT_TAB" && this.getErrorAlertRow(errorMsg)}
                            <EventExportConfiguration {...formProps}
                                externalSystemId={formProps.item.id}
                                isDirty={formProps.dirty}
                                exportEventFromDate={formProps.item.exportEventFromDate}
                                integrationStatus={formProps.item.integrationStatus}
                                onChange={this.onExportFromChange}
                                exportEventDetails={formProps.item.exportEventDetails}
                                onEventDataChange={this.onEventDataChange} />
                        </TabStripTab>
                    }
                    {
                        (complexIntegrations.includes(integrationSystem) || integrationSystem == IntegrationSystems.Brivo) &&
                        <TabStripTab title={this.getTabHeader(settingsKey, errorTab == "MIDDLEWARE_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            {errorTab == "MIDDLEWARE_TAB" && this.getErrorAlertRow(errorMsg)}
                            <MiddlewareConfiguration {...formProps} />
                        </TabStripTab>
                    }
                    {
                        ((complexIntegrations.includes(integrationSystem) && integrationSystem != IntegrationSystems.C4) || integrationSystem == IntegrationSystems.Brivo) &&
                        <TabStripTab title={this.getTabHeader("TEXT_DATA_MASKS", errorTab == "DATA_MASK_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            {errorTab == "DATA_MASK_TAB" && this.getErrorAlertRow(errorMsg)}
                            <DataMaskConfiguration {...formProps} />
                        </TabStripTab>
                    }
                    {
                        complexIntegrations.includes(integrationSystem) &&
                        integrationSystem != IntegrationSystems.Integriti && integrationSystem != IntegrationSystems.CCure && integrationSystem != IntegrationSystems.C4 &&
                        <TabStripTab title={this.getTabHeader("TEXT_ANTI_TAILGATING", errorTab == "ANTI_TAILGATING_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            {errorTab == "ANTI_TAILGATING_TAB" && this.getErrorAlertRow(errorMsg)}
                            <AntiTailgatingConfiguration {...formProps} />
                        </TabStripTab>
                    }
                    {
                        integrationSystem == IntegrationSystems.Sine &&
                        <TabStripTab title={this.getTabHeader("TEXT_SETTINGS", errorTab == "SETTINGS_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            {errorTab == "SETTINGS_TAB" && this.getErrorAlertRow(errorMsg)}
                            <SineSettingsTab {...formProps} />
                        </TabStripTab>
                    }
                    {
                        integrationSystem == IntegrationSystems.AzureAD &&
                        <TabStripTab title={this.getTabHeader("TEXT_ROLE_MAPPINGS", errorTab == "ROLE_MAPPINGS_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            {errorTab == "ROLE_MAPPINGS_TAB" && this.getErrorAlertRow(errorMsg)}
                            <RoleMappingsTab {...formProps} />
                        </TabStripTab>
                    }
                    {
                        (integrationSystem == IntegrationSystems.Gallagher8 || integrationSystem == IntegrationSystems.Brivo) &&
                        <TabStripTab title={this.getTabHeader("TEXT_DEVICE_MAPPINGS", errorTab == "DEVICE_MAPPINGS_TAB", formProps.isNew)} disabled={formProps.isNew}>
                            {errorTab == "DEVICE_MAPPINGS_TAB" && this.getErrorAlertRow(errorMsg)}
                            <DeviceMappingsTab {...formProps} />
                        </TabStripTab>
                    }
                </TabStrip>
            </div>
        );
    }
}

export default DetailPageContainer(ExternalSystemDetails, 'ExternalSystemDetails', 'externalsystem', () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() }
});



// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/ExternalSystemDetails.tsx