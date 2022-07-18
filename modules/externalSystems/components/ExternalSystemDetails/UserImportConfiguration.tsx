import * as React from "react";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { Row, Col, Label } from "reactstrap";
import { localise, lookupService, configService, permissionService } from "src/modules/shared/services";
import { Field } from "redux-form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { TimePicker } from "@progress/kendo-react-dateinputs";
import { Grid, GridColumn, GridSortChangeEvent, GridCellProps } from "@progress/kendo-react-grid";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { UserFieldMap, ExternalSystem, UserSynchronisationSelection, TempUserFieldMap, IntegrationStatus } from "../../types/dto";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import "./external-system-detail.css"
import { externalSystemsService } from "../../services/externalSystems.service";
import * as moment from 'moment';
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";

interface CustomProps {
    integrationSystem: string;
    userFieldMappingList: UserFieldMap[];
    integrationStatus: string;
    isDirty: boolean;
    externalSystemId: string;
}

interface State {
    userSynchronisationSelection: string;
    syncInterval?: string;
    scheduleDay?: string;
    scheduleTime?: Date;
    userFieldMappingList: TempUserFieldMap[];
    sort: SortDescriptor[];
    isButtonDisabled: boolean;
}

export class UserImportConfiguration extends React.Component<CustomProps & DetailFormProps, State> {
    constructor(props: CustomProps & DetailFormProps) {
        super(props);
        this.onRadioOptionSelectionChange = this.onRadioOptionSelectionChange.bind(this);
        this.onIntervalSelectionChange = this.onIntervalSelectionChange.bind(this);
        this.onScheduleBasedDaySelectionChange = this.onScheduleBasedDaySelectionChange.bind(this);
        this.onScheduleBasedTimeSelectionChange = this.onScheduleBasedTimeSelectionChange.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
        this.onFieldSelectionChange = this.onFieldSelectionChange.bind(this);
        this.onAllFieldSelectionChange = this.onAllFieldSelectionChange.bind(this);
        this.onExternalSystemFieldChange = this.onExternalSystemFieldChange.bind(this);
        this.onForceSyncButtonClick = this.onForceSyncButtonClick.bind(this);

        let externalSystemDetails = props.initialValues as ExternalSystem;
        let userSyncSelection = externalSystemDetails.userSynchronisationSelection || UserSynchronisationSelection.IntervalBased;

        this.state = {
            userSynchronisationSelection: userSyncSelection,
            syncInterval: externalSystemDetails.syncInterval,
            scheduleDay: externalSystemDetails.scheduleDay,
            scheduleTime: (externalSystemDetails.scheduleTime && externalSystemDetails.scheduleTime != '') ? new Date(externalSystemDetails.scheduleTime) : undefined,
            userFieldMappingList: externalSystemsService.processUserFieldMappings(this.props.userFieldMappingList),
            sort: [],
            isButtonDisabled: false
        };
    }

    componentDidMount() {
    }

    onForceSyncButtonClick(event: any) {
        event.preventDefault();
        this.setState({
            isButtonDisabled: true
        });

        setTimeout(() => this.setState({ ...this.state, isButtonDisabled: false }), 10000);


        externalSystemsService.updateForceUserImportEpoch(this.props.externalSystemId);
    }

    onRadioOptionSelectionChange(event: any) {
        let selection = event.target.value;

        let syncInterval;
        let scheduleDay;
        let scheduleTime;
        var formatedDateTime;

        if (selection == UserSynchronisationSelection.IntervalBased) {
            syncInterval = "48:00:00";
            scheduleDay = '';
            scheduleTime = undefined;
            formatedDateTime = ''
        }
        else {
            syncInterval = '';
            scheduleDay = "SATURDAY";
            scheduleTime = new Date(new Date().setHours(0, 0, 0));
            formatedDateTime = moment(scheduleTime).format("YYYY-MM-DD HH:mm:ss");
        }

        this.setState(
            {
                ...this.state,
                userSynchronisationSelection: selection,
                syncInterval: syncInterval,
                scheduleDay: scheduleDay,
                scheduleTime: scheduleTime,
            });
        this.props.change("userSynchronisationSelection", selection);
        this.props.change("syncInterval", syncInterval);
        this.props.change("scheduleDay", scheduleDay);
        this.props.change("scheduleTime", formatedDateTime);
    }

    onIntervalSelectionChange(event: any) {
        let selectedValue = event.target.value;
        this.setState({ ...this.state, syncInterval: selectedValue })
        this.props.change("syncInterval", selectedValue);
    }

    onScheduleBasedDaySelectionChange(event: any) {
        let selectedValue = event.target.value;
        this.setState({ ...this.state, scheduleDay: selectedValue })
        this.props.change("scheduleDay", selectedValue);
    }

    onScheduleBasedTimeSelectionChange(event: any) {
        let selectedValue = event.target.value;
        var formatedDateTime = moment(selectedValue).format("YYYY-MM-DD HH:mm:ss");
        this.setState({ ...this.state, scheduleTime: selectedValue })
        this.props.change("scheduleTime", formatedDateTime);
    }

    onSortChange(event: GridSortChangeEvent) {
        this.setState({ ...this.state, sort: event.sort })
    }

    onFieldSelectionChange(event: any) {
        let { userFieldMappingList } = this.state;
        var dataItem = event.dataItem as TempUserFieldMap;
        let selected = event.syntheticEvent.target.checked

        let selectedMapping = userFieldMappingList.find(m => m.systemField == dataItem.systemField);
        if (selectedMapping) {
            selectedMapping.isSelected = selected;
            if (!selected) {
                selectedMapping.thirdPartyField = undefined;
            }
            this.setState({
                ...this.state,
                userFieldMappingList: userFieldMappingList
            });
            this.props.change("tempUserFieldMappingList", userFieldMappingList);
        }
    }

    onAllFieldSelectionChange(event: any) {
        let { userFieldMappingList } = this.state;
        let selected = event.syntheticEvent.target.checked
        userFieldMappingList.forEach(mapping => {
            mapping.isSelected = selected;
            if (!selected) {
                mapping.thirdPartyField = undefined;
            }
        });
        this.setState({
            ...this.state,
            userFieldMappingList: userFieldMappingList
        });
        this.props.change("tempUserFieldMappingList", userFieldMappingList);
    }


    onExternalSystemFieldChange(event: any, systemField: string) {
        let { userFieldMappingList } = this.state;
        let selectedField = userFieldMappingList.find(m => m.systemField == systemField);
        if (selectedField) {
            selectedField.thirdPartyField = event.target.value;
            this.setState({
                ...this.state,
                userFieldMappingList: userFieldMappingList
            });
        }
        this.props.change("tempUserFieldMappingList", userFieldMappingList);
    }

    ExternalSystemFieldCell(integrationSystem: string, onExternalSystemFieldChange: (event: any, systemField: string) => void) {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }
            render() {
                const systems = lookupService.getList("LIST_INTEGRATION_SYSTEMS");
                let externalSystemLookup = systems.find(s => s.value == integrationSystem);
                let externalSystemSettingsLookupKey = externalSystemLookup && externalSystemLookup.childLookupKey;
                let externalSystemSettingsLookup = lookupService.getList(externalSystemSettingsLookupKey || '');
                let externalSystemUserFieldSetting = externalSystemSettingsLookup.find(s => s.value == "USER_FIELDS");
                return (
                    <td>
                        {
                            <LookupDropDown lookupKey={externalSystemUserFieldSetting && externalSystemUserFieldSetting.childLookupKey || ''} allowBlank={true}
                                disabled={!this.props.dataItem.isSelected} value={this.props.dataItem.thirdPartyField}
                                onChange={(e) => onExternalSystemFieldChange(e, this.props.dataItem.systemField)} />
                        }
                    </td>
                );
            }
        }
    }

    render() {
        const { isDirty, integrationSystem, integrationStatus, item } = this.props
        const { userFieldMappingList, sort, userSynchronisationSelection, syncInterval, scheduleDay, scheduleTime, isButtonDisabled } = this.state;
        const isAllSelected = userFieldMappingList && userFieldMappingList.length != 0 && userFieldMappingList.every(i => i.isSelected);
        const isForceSyncButtonDisabled = isDirty || integrationStatus == IntegrationStatus.Inactive || isButtonDisabled || !item.isMiddlewareConnected;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <div className="user-import-tab">
                <Row className="section-header">
                    <Col>
                        <Label className="system-label">{localise('TEXT_SYNCHRONISATION_SCHEDULE')}*</Label>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6} xl={4}>
                        <Row>
                            <Col>
                                <Label className="system-label">
                                    <Field id="intervalBasedSelection" component="input" type="radio" name="intervalBasedSelection"
                                        value={UserSynchronisationSelection.IntervalBased} onChange={this.onRadioOptionSelectionChange}
                                        checked={userSynchronisationSelection === "IntervalBased"} disabled={!isPermittedToEdit}/>
                                    {localise('TEXT_INTERVAL_BASED_SYNCHRONISATION')}
                                </Label>
                            </Col>
                        </Row>
                        <Row className="sync-details">
                            <Col className="dropdown-col">
                                <LookupDropDown lookupKey={"LIST_USER_SYNCHRONISATION_INTERVALS"} value={syncInterval}
                                    onChange={this.onIntervalSelectionChange} disabled={userSynchronisationSelection == 'ScheduleBased' || !isPermittedToEdit} />
                            </Col>
                        </Row>
                        <Row className="sync-details">
                            <Col>
                                <small className="text-muted" >{localise("REMARK_INTERVAL_BASED_SYNC")}</small>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={6} xl={4} className="mt-3 mt-lg-0">
                        <Row>
                            <Col>
                                <Label className="system-label">
                                    <Field id="scheduleBasedSelection" component="input" type="radio" name="scheduleBasedSelection"
                                        value={UserSynchronisationSelection.ScheduleBased} onChange={this.onRadioOptionSelectionChange}
                                        checked={userSynchronisationSelection === "ScheduleBased"} disabled={!isPermittedToEdit} />
                                    {localise('TEXT_SCHEDULE_BASED_SYNCHRONISATION')}
                                </Label>
                            </Col>
                        </Row>
                        <Row className="sync-details">
                            <Col xs={5} className="dropdown-col">
                                <LookupDropDown lookupKey={"LIST_WEEKDAYS"} value={scheduleDay} onChange={this.onScheduleBasedDaySelectionChange}
                                    disabled={userSynchronisationSelection != 'ScheduleBased' || !isPermittedToEdit} />
                            </Col>
                            <Col xs={7}>
                                <TimePickerComp disabled={userSynchronisationSelection != 'ScheduleBased' || !isPermittedToEdit} value={scheduleTime}
                                    onTimeSelectionChange={this.onScheduleBasedTimeSelectionChange} />
                            </Col>
                        </Row>
                        <Row className="sync-details">
                            <Col>
                                <small className="text-muted">{localise("REMARK_SCHEDULE_BASED_SYNC")}</small>
                            </Col>
                        </Row>
                    </Col>
                    <Col xl={4} className="force-user-sync">
                        <Row>
                            <Col>
                                <ActionButton key="importbtn" textKey="BUTTON_FORCE_SYNC" color="primary" icon="fas fa-redo-alt fa-flip-horizontal"
                                    title={isForceSyncButtonDisabled ? localise('TEXT_FORCE_SYNC_BUTTON_TOOLTIP') : ""}
                                    onClick={this.onForceSyncButtonClick} disabled={isForceSyncButtonDisabled || !isPermittedToEdit} />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <small className="text-muted">{localise("REMARK_FORCE_SYNC_USERS_BUTTON")}</small>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="user-filed-mapping">
                    <Col>
                        <small className="text-muted">{localise("TEXT_MAP_USER_RELATED_FIELDS")}</small>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <small className="color-blue"> ({userFieldMappingList.filter(i => i.isSelected).length || 0}/{userFieldMappingList.length} {localise('TEXT_SELECTED')}) </small>
                        <Grid data={orderBy(userFieldMappingList, sort)}
                            sort={sort} onSortChange={this.onSortChange}
                            sortable={{ allowUnsort: false, mode: 'single' }}
                            selectedField="isSelected"
                            onSelectionChange={this.onFieldSelectionChange}
                            onHeaderSelectionChange={this.onAllFieldSelectionChange}
                            className={isPermittedToEdit ? "" : "disabled-grid"} >
                            <GridColumn field="isSelected" className="checkbox-grid-column" headerClassName="checkbox-grid-column"
                                headerSelectionValue={isAllSelected} />
                            <GridColumn field="tytonUserFieldText" title={`${configService.getConfigurationValue("PRODUCT_NAME")} ${localise("TEXT_SYSTEM_FIELD")}`} />
                            <GridColumn field="description" title={localise('TEXT_DESCRIPTION')} />
                            <GridColumn field="thirdPartyField" title={localise('TEXT_EXTERNAL_SYSTEM_FIELD')} cell={this.ExternalSystemFieldCell(integrationSystem, this.onExternalSystemFieldChange)} />
                        </Grid>
                    </Col>
                </Row>
            </div>
        )
    }
}

const TimePickerComp = (props: any) => {
    return (
        <TimePicker {...props} key={props.disabled} disabled={props.disabled} className="time-field"
            width={140}
            popupSettings={{ animate: false }}
            format={dateTimeUtilService.getKendoTimeFormat()}
            formatPlaceholder={{ hour: 'hh', minute: 'mm' }}
            value={props.value || null}
            onChange={(event: any) => {
                props.onTimeSelectionChange(event);
            }} />
    );
}


// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/UserImportConfiguration.tsx