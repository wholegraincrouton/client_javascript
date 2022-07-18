import * as React from "react";
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu } from "reactstrap";
import { localise, accountSessionService, permissionService } from "../../modules/shared/services";
import { UserProfileImageConstants } from "src/modules/users/types/dto";
import { StoreState } from "src/redux/store";
import { connect } from "react-redux";

export interface State {
    userMenuOpen: boolean;
}

export interface Props {
    hasImage?: boolean;
    imageURL?: string;
    history?: any;
}

class UserMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.toggleUserMenu = this.toggleUserMenu.bind(this);
        this.onUserNameClick = this.onUserNameClick.bind(this);

        this.state = {
            userMenuOpen: false
        }
    }

    toggleUserMenu() {
        this.setState({ ...this.state, userMenuOpen: !this.state.userMenuOpen });
    }

    onUserNameClick() {
        const userId = accountSessionService.getLoggedInUserId();
        this.props.history.push("/users/usermanagement/" + userId);
    }

    render() {
        const { userMenuOpen } = this.state;
        const canViewProfile = permissionService.checkIfPermissionExists("USER_UPDATE");
        let loggedInUser = accountSessionService.getAuthenticatedUser();
        const url = loggedInUser && loggedInUser.hasProfileImage ?
            loggedInUser.profileImageURL : UserProfileImageConstants.DefaultImagePath;

        return (
            <Dropdown tag="li" isOpen={userMenuOpen} toggle={this.toggleUserMenu}>
                <DropdownToggle tag="a" href="javascript:void(0);" className="no-after peers fxw-nw ai-c lh-1">
                    <div className="peer">
                        <img className="avatar-image" src={url} alt="User Avatar" />
                    </div>
                </DropdownToggle>
                <DropdownMenu tag="ul" className="fsz-sm">
                    <li className={canViewProfile ? "clickable" : "non-clickable"}>
                        <a className="d-b td-n pY-5" onClick={canViewProfile ? this.onUserNameClick : () => { }}>
                            {accountSessionService.getLoggedInUserDisplayName()}
                        </a>
                    </li>
                    <li>
                        <Link to="/account/signout" className="d-b td-n pY-5">
                            <i className="fas fa-sign-out-alt mR-10"></i>
                            <span> {localise("TEXT_SIGNOUT")}</span>
                        </Link>
                    </li>
                </DropdownMenu>
            </Dropdown>
        );
    }
}

const mapStateToProps = (store: StoreState) => {
    const { hasImage, imageURL } = store.userAvatar;
    return { hasImage, imageURL };
};

export default connect(mapStateToProps)(UserMenu);



// WEBPACK FOOTER //
// ./src/layouts/Header/UserMenu.tsx