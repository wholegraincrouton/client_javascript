import * as React from "react";
import { Row, Col } from "reactstrap";
import { Dialog } from "@progress/kendo-react-dialogs";
import Dropzone from "react-dropzone";
import MediaQuery from "react-responsive";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { ActionButton, BackButton, SaveButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { apiService, globalDirtyService, confirmDialogService, localise, configService } from "src/modules/shared/services";
import { userImageService } from "../../../services/user-image.service";
import { UserProfileImageConstants } from "../../../types/dto";
import './cropper.css';
import './profile-image-control.css';
import { permissionService } from '../../../../shared/services/permission.service';

interface Props {
    userId?: string;
    hasImage: boolean;
    onChange: (hasImage: boolean, url?: string) => void;
    profileImageURL?: string;
}

interface State {
    showPopup: boolean;
    isDirty: boolean;
    hasImage: boolean;
    hasTempImage: boolean;
    imageURL: string;
    tempImageURL?: string;
    tempImageData?: any;
    croppedImageURL?: string;
    croppedImageData?: any;
    hasPageUploadError: boolean;
    pageErrorKey?: string;
    hasPopupUploadError: boolean;
    popupErrorKey?: string;
}

export class UserProfileImageControl extends React.Component<Props, State> {
    cropper: any;
    allowedFileTypes: string;
    maxFileSize: number;
    isPermittedToEdit: boolean = false;

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
            hasImage: props.hasImage,
            hasTempImage: props.hasImage,
            imageURL: props.profileImageURL || UserProfileImageConstants.DefaultImagePath,
            tempImageURL: props.profileImageURL,
            hasPageUploadError: false,
            hasPopupUploadError: false
        }
        window.addEventListener("beforeunload", this.dirtyPageHandler);
    }

    componentDidMount() {
        const { userId, profileImageURL } = this.props;
        const { hasImage } = this.state;

        if (userId && hasImage && !profileImageURL) {
            apiService.get('account', 'GetProfileImageReadUrl', undefined, { userId: userId }, false, false, apiConstants.ACCOUNTS)
                .then((url: string) => {
                    this.setState({
                        ...this.state,
                        imageURL: url,
                        tempImageURL: url
                    });
                });
        }
    }

    //#region Event handlers

    onEdit() {
        this.setState({
            ...this.state,
            showPopup: true,
            tempImageURL: this.state.imageURL,
            croppedImageURL: this.state.imageURL
        });
    }

    onBack() {
        const { isDirty } = this.state;

        if (isDirty) {
            globalDirtyService.showDirtyConfirmation(() => {
                window.removeEventListener("beforeunload", this.dirtyPageHandler);
                this.revertImageChanges();
            }, "CONFIRMATION_UNSAVED_CHANGES_POPUP")
            return;
        }
        this.revertImageChanges();
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
                    hasTempImage: true,
                    tempImageURL: reader.result,
                    tempImageData: file,
                    croppedImageURL: reader.result,
                    croppedImageData: file,
                    hasPageUploadError: false,
                    pageErrorKey: undefined,
                    hasPopupUploadError: false,
                    popupErrorKey: undefined
                });
        }, false);
        reader.readAsDataURL(file);
    }

    onCrop() {
        const image = this.cropper.getCroppedCanvas();
        image.toBlob((blob: any) => {
            this.setState({
                ...this.state,
                isDirty: true,
                croppedImageURL: image.toDataURL(),
                croppedImageData: blob
            });
        });
    }

    onRemove() {
        confirmDialogService.showDialog('CONFIRMATION_REMOVE_USER_IMAGE',
            () => {
                userImageService.removeUserImage();
                window.removeEventListener("beforeunload", this.dirtyPageHandler);
                this.props.onChange(false, "");

                this.setState({
                    ...this.state,
                    isDirty: false,
                    showPopup: false,
                    hasImage: false,
                    hasTempImage: false,
                    imageURL: UserProfileImageConstants.DefaultImagePath,
                    tempImageURL: undefined,
                    tempImageData: undefined,
                    croppedImageURL: undefined,
                    croppedImageData: undefined,
                    hasPopupUploadError: false,
                    popupErrorKey: undefined
                });
            });
    }

    onSave() {
        const { croppedImageURL, croppedImageData } = this.state;

        userImageService.setUserImage(croppedImageData);
        window.removeEventListener("beforeunload", this.dirtyPageHandler);
        this.props.onChange(true, croppedImageURL);

        this.setState({
            ...this.state,
            isDirty: false,
            showPopup: false,
            hasImage: true,
            imageURL: croppedImageURL || '',
            tempImageURL: undefined,
            tempImageData: undefined,
            croppedImageURL: undefined,
            croppedImageData: undefined,
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

    revertImageChanges() {
        this.setState({
            ...this.state,
            showPopup: false,
            isDirty: false,
            hasTempImage: this.state.hasImage,
            tempImageURL: undefined,
            tempImageData: undefined,
            croppedImageURL: undefined,
            croppedImageData: undefined,
            hasPopupUploadError: false,
            popupErrorKey: undefined
        });
    }

    getCropper(height: number, width: number) {
        const { tempImageURL } = this.state;
        var Cropper = require('react-cropper').default;

        return (
            <Cropper ref='cropper' src={tempImageURL} viewMode={2} aspectRatio={1} autocrop={false}
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
        const { userId } = this.props;
        this.isPermittedToEdit = permissionService.isActionPermittedForCustomer(userId ?'UPDATE': 'NEW');
        return (
            <Dropzone onDrop={this.onUpload} multiple={false} accept={this.allowedFileTypes} disabled={!this.isPermittedToEdit}>
                {({ getRootProps, getInputProps, open }) => (
                    <section>
                        <div {...getRootProps({ onClick: evt => evt.preventDefault() })}>
                            <input {...getInputProps()} />
                            <ActionButton textKey={buttonKey} color="secondary" disabled={!this.isPermittedToEdit}
                                icon="fa-file-upload" onClick={open}
                                />
                        </div>
                    </section>
                )}
            </Dropzone>
        );
    }

    //#endregion

    render() {
        const { profileImageURL } = this.props;
        const { showPopup, isDirty, hasImage, hasTempImage, imageURL, tempImageURL,
            hasPopupUploadError, hasPageUploadError, popupErrorKey, pageErrorKey } = this.state;

        return (
            <div className={"profile-image-control" + (hasPopupUploadError ? " has-image-error" : "")}>
                <Row className="profile-image-row">
                    <Col>
                        <Row>
                            <Col>
                                <img src={imageURL} alt="User Profile Image" />
                            </Col>
                        </Row>
                        {
                            !profileImageURL &&
                            <Row>
                                <Col>
                                    {
                                        hasImage ?
                                            <ActionButton textKey="BUTTON_EDIT_PHOTO" color="secondary"
                                                icon="fa-edit" onClick={this.onEdit} />
                                            :
                                            this.getDropzone("BUTTON_UPLOAD_PHOTO")
                                    }
                                </Col>
                            </Row>
                        }
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
                        <div className="profile-image-dialog">
                            <div className="ty-modal-header">
                                <Row>
                                    <Col className="text-left">
                                        <BackButton onClick={this.onBack} />
                                    </Col>
                                    <Col className="text-right">
                                        <SaveButton onClick={this.onSave} disabled={!this.isPermittedToEdit || !isDirty} />
                                    </Col>
                                </Row>
                            </div>
                            <div className="ty-modal-body">
                                <Row>
                                    <Col>
                                        {
                                            hasPopupUploadError && popupErrorKey &&
                                            <Row className="image-cropper-error">
                                                <Col className="text-center">
                                                    <small className="text-danger">{localise(popupErrorKey)}</small>
                                                </Col>
                                            </Row>
                                        }
                                        <Row className="image-cropper">
                                            <Col className="text-center">
                                                {
                                                    hasTempImage ?
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
                                                        <img src={tempImageURL} />
                                                }
                                            </Col>
                                        </Row>
                                        <Row className="image-cropper-buttons">
                                            <Col className="text-center">
                                                {this.getDropzone("BUTTON_UPLOAD")}
                                            </Col>
                                            {
                                                hasTempImage &&
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
// ./src/modules/users/components/UserDetails/UserProfileImage/UserProfileImageControl.tsx