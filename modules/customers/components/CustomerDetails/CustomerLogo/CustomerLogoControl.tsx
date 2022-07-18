import * as React from "react";
import { Row, Col } from "reactstrap";
import { Dialog } from "@progress/kendo-react-dialogs";
import Dropzone from "react-dropzone";
import MediaQuery from "react-responsive";
import { ActionButton, BackButton, SaveButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { apiService, globalDirtyService, confirmDialogService, localise, configService } from "src/modules/shared/services";
import './cropper.css';
import './customer-logo-control.css';
import { CustomerLogoConstants } from "src/modules/customers/types/dto";
import { customerLogoService } from "src/modules/customers/services/customer-logo.service";

interface Props {
    customerId?: string;
    hasLogo: boolean;
    onChange: (hasLogo: boolean, url?: string) => void;
    readonly?: boolean;
}

interface State {
    showPopup: boolean;
    isDirty: boolean;
    hasLogo: boolean;
    hasTempLogo: boolean;
    logoURL: string;
    tempLogoURL?: string;
    tempLogoData?: any;
    croppedLogoURL?: string;
    croppedLogoData?: any;
    hasPageUploadError: boolean;
    pageErrorKey?: string;
    hasPopupUploadError: boolean;
    popupErrorKey?: string;
}

export class CustomerLogoControl extends React.Component<Props, State> {
    cropper: any;
    allowedFileTypes: string;
    maxFileSize: number;

    constructor(props: Props) {
        super(props);
        this.dirtyPageHandler = this.dirtyPageHandler.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onUpload = this.onUpload.bind(this);
        this.onCrop = this.onCrop.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onSave = this.onSave.bind(this);
        this.getCropper = this.getCropper.bind(this);
        this.getDropzone = this.getDropzone.bind(this);

        this.allowedFileTypes = configService.getConfigurationValue("PROFILE_IMAGE_ALLOWED_FILE_TYPES");
        this.maxFileSize = +configService.getConfigurationValue("MAXIMUM_PROFILE_IMAGE_FILE_SIZE_MB") * 1024 * 1024;

        this.state = {
            showPopup: false,
            isDirty: false,
            hasLogo: props.hasLogo,
            hasTempLogo: props.hasLogo,
            logoURL: CustomerLogoConstants.DefaultLogoPath,
            hasPageUploadError: false,
            hasPopupUploadError: false
        }
        window.addEventListener("beforeunload", this.dirtyPageHandler);
    }

    componentDidMount() {
        const { customerId } = this.props;
        const { hasLogo } = this.state;

        if (customerId && hasLogo) {
            apiService.get('customer', 'GetLogoReadUrl', undefined, { customerId: customerId })
                .then((url: string) => {
                    this.setState({
                        ...this.state,
                        logoURL: url,
                        tempLogoURL: url
                    });
                });
        }
    }

    //#region Event handlers

    onEdit() {
        this.setState({
            ...this.state,
            showPopup: true,
            tempLogoURL: this.state.logoURL,
            croppedLogoURL: this.state.logoURL
        });
    }

    onBack() {
        const { isDirty } = this.state;

        if (isDirty) {
            globalDirtyService.showDirtyConfirmation(() => {
                window.removeEventListener("beforeunload", this.dirtyPageHandler);
                this.revertLogoChanges();
            }, "CONFIRMATION_UNSAVED_CHANGES_POPUP")
            return;
        }
        this.revertLogoChanges();
    }

    onUpload(files: File[]) {
        const file = files[0];

        if (!file || !this.allowedFileTypes.split(", ").some(t => t == file.type)) {
            this.setState({
                ...this.state,
                hasPageUploadError: !this.state.showPopup,
                hasPopupUploadError: this.state.showPopup,
                pageErrorKey: !this.state.showPopup ? "ERROR_UPLOAD_IMAGE_TYPE" : undefined,
                popupErrorKey: this.state.showPopup ? "ERROR_UPLOAD_IMAGE_TYPE" : undefined
            });
            return;
        }

        if (file.size > this.maxFileSize) {
            this.setState({
                ...this.state,
                hasPageUploadError: !this.state.showPopup,
                hasPopupUploadError: this.state.showPopup,
                pageErrorKey: !this.state.showPopup ? "ERROR_UPLOAD_IMAGE_SIZE" : undefined,
                popupErrorKey: this.state.showPopup ? "ERROR_UPLOAD_IMAGE_SIZE" : undefined
            });
            return;
        }

        const self = this;
        const reader = new FileReader();

        reader.addEventListener("load", function () {
            if (typeof reader.result == "string")
                self.setState({
                    ...self.state,
                    showPopup: true,
                    isDirty: true,
                    hasTempLogo: true,
                    tempLogoURL: reader.result,
                    tempLogoData: file,
                    croppedLogoURL: reader.result,
                    croppedLogoData: file,
                    hasPageUploadError: false,
                    pageErrorKey: undefined,
                    hasPopupUploadError: false,
                    popupErrorKey: undefined
                });
        }, false);
        reader.readAsDataURL(file);
    }

    onCrop() {
        const logo = this.cropper.getCroppedCanvas();
        logo.toBlob((blob: any) => {
            this.setState({
                ...this.state,
                isDirty: true,
                croppedLogoURL: logo.toDataURL(),
                croppedLogoData: blob
            });
        });
    }

    onRemove() {
        confirmDialogService.showDialog('CONFIRMATION_REMOVE_USER_IMAGE',
            () => {
                customerLogoService.removeCustomerLogo();
                window.removeEventListener("beforeunload", this.dirtyPageHandler);
                this.props.onChange(false, "");

                this.setState({
                    ...this.state,
                    isDirty: false,
                    showPopup: false,
                    hasLogo: false,
                    hasTempLogo: false,
                    logoURL: CustomerLogoConstants.DefaultLogoPath,
                    tempLogoURL: undefined,
                    tempLogoData: undefined,
                    croppedLogoURL: undefined,
                    croppedLogoData: undefined,
                    hasPopupUploadError: false,
                    popupErrorKey: undefined
                });
            });
    }

    onSave() {
        const { croppedLogoURL, croppedLogoData } = this.state;

        customerLogoService.setCustomerLogo(croppedLogoData);
        window.removeEventListener("beforeunload", this.dirtyPageHandler);
        this.props.onChange(true, croppedLogoURL);

        this.setState({
            ...this.state,
            isDirty: false,
            showPopup: false,
            hasLogo: true,
            logoURL: croppedLogoURL || '',
            tempLogoURL: undefined,
            tempLogoData: undefined,
            croppedLogoURL: undefined,
            croppedLogoData: undefined,
            hasPopupUploadError: false,
            popupErrorKey: undefined
        });
    }

    //#endregion

    //#region Private methods

    dirtyPageHandler(e: any) {
        const { isDirty } = this.state;

        if (isDirty) {
            e.returnValue = "";
            return "";
        }
        return;
    }

    revertLogoChanges() {
        this.setState({
            ...this.state,
            showPopup: false,
            isDirty: false,
            hasTempLogo: this.state.hasLogo,
            tempLogoURL: undefined,
            tempLogoData: undefined,
            croppedLogoURL: undefined,
            croppedLogoData: undefined,
            hasPopupUploadError: false,
            popupErrorKey: undefined
        });
    }

    getCropper(height: number, width: number) {
        const { tempLogoURL } = this.state;
        var Cropper = require('react-cropper').default;

        return (
            <Cropper ref='cropper' src={tempLogoURL} viewMode={2} aspectRatio={1} autocrop={false}
                style={{ height: height, width: width }} cropend={this.onCrop} zoom={this.onCrop}
                ready={() => {
                    this.cropper = (this.refs.cropper as any);
                    this.cropper.setCropBoxData({
                        left: 0, top: 0, height: height, width: width
                    });
                }} />
        );
    }

    getDropzone(buttonKey: string) {
        return (
            <Dropzone onDrop={this.onUpload} multiple={false} accept={this.allowedFileTypes}>
                {({ getRootProps, getInputProps, open }) => (
                    <section>
                        <div {...getRootProps({ onClick: evt => evt.preventDefault() })}>
                            <input {...getInputProps()} />
                            <ActionButton textKey={buttonKey} color="secondary"
                                icon="fa-file-upload" onClick={open} />
                        </div>
                    </section>
                )}
            </Dropzone>
        );
    }

    //#endregion

    render() {
        const { showPopup, isDirty, hasLogo, hasTempLogo, logoURL, tempLogoURL,
            hasPopupUploadError, hasPageUploadError, popupErrorKey, pageErrorKey } = this.state;
        const { readonly } = this.props;

        return (
            <div className={"profile-logo-control" + (hasPopupUploadError ? " has-logo-error" : "")}>
                <Row className="profile-logo-row">
                    <Col>
                        <Row>
                            <Col>
                                <img src={logoURL} alt="Company Logo" />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {
                                    hasLogo ?
                                        <ActionButton textKey="BUTTON_EDIT_PHOTO" color="secondary"
                                            icon="fa-edit" onClick={this.onEdit} />
                                        :
                                        this.getDropzone("BUTTON_UPLOAD_PHOTO")
                                }
                            </Col>
                        </Row>
                        {
                            hasPageUploadError && pageErrorKey &&
                            <Row className="mt-2">
                                <Col>
                                    <small className="text-danger">{localise(pageErrorKey)}</small>
                                </Col>
                            </Row>
                        }
                    </Col>
                </Row>
                {
                    showPopup &&
                    <Dialog>
                        <div className="profile-logo-dialog">
                            <div className="ty-modal-header">
                                <Row>
                                    <Col className="text-left">
                                        <BackButton onClick={this.onBack} />
                                    </Col>
                                    <Col className="text-right">
                                        <SaveButton onClick={this.onSave} disabled={!isDirty || readonly} />
                                    </Col>
                                </Row>
                            </div>
                            <div className="ty-modal-body">
                                <Row>
                                    <Col>
                                        {
                                            hasPopupUploadError && popupErrorKey &&
                                            <Row className="logo-cropper-error">
                                                <Col className="text-center">
                                                    <small className="text-danger">{localise(popupErrorKey)}</small>
                                                </Col>
                                            </Row>
                                        }
                                        <Row className="logo-cropper">
                                            <Col className="text-center">
                                                {
                                                    hasTempLogo ?
                                                        <>
                                                            <MediaQuery minDeviceWidth={1001}>
                                                                {this.getCropper(250, 250)}
                                                            </MediaQuery>
                                                            <MediaQuery minDeviceWidth={390} maxDeviceWidth={1000}>
                                                                {this.getCropper(200, 200)}
                                                            </MediaQuery>
                                                            <MediaQuery maxDeviceWidth={389}>
                                                                {this.getCropper(150, 150)}
                                                            </MediaQuery>
                                                        </>
                                                        :
                                                        <img src={tempLogoURL} />
                                                }
                                            </Col>
                                        </Row>
                                        <Row className="logo-cropper-buttons">
                                            <Col className="text-center">
                                                {this.getDropzone("BUTTON_UPLOAD")}
                                            </Col>
                                            {
                                                hasTempLogo &&
                                                <Col className="text-center">
                                                    <ActionButton textKey="BUTTON_REMOVE" color="secondary" icon="fa-trash" onClick={this.onRemove} />
                                                </Col>
                                            }
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Dialog>
                }
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/customers/components/CustomerDetails/CustomerLogo/CustomerLogoControl.tsx