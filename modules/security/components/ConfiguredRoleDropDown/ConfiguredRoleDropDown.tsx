import * as React from "react";
import { Input } from "reactstrap";
import { lookupService, localise, permissionService} from "../../../shared/services";
import { RoleFilter } from "src/modules/shared/components/RoleFilter/RoleFilter";
import { LookupItem } from "src/modules/shared/types/dto";
import { PermissionConfig } from "../../types/dto";

interface RoleDropDownProps {
    onChange?: (event: React.ChangeEvent) => void;
    name?: string;
    value?: string;
    section?: string;
    disabled?: boolean;
    allowAny?: boolean;
    textAny?: string;
    customerId?: string;
    role?: string;
}

interface State {
    configuredRoleList: PermissionConfig[];
}

export class ConfiguredRoleDropDown extends React.Component<RoleDropDownProps, State> {

    constructor(props: RoleDropDownProps) {
        super(props);
        this.state = {
            configuredRoleList: [],
        };
        this.handleChange = this.handleChange.bind(this);

    }

    handleChange(e: React.ChangeEvent) {
        this.props.onChange && this.props.onChange(e);
    }

    componentDidMount() {
        if (this.props.customerId != undefined && this.props.customerId != "") {
            permissionService.getConfiguredRoles(this.props.customerId).then((data: PermissionConfig[]) => {
                this.setState({
                    ...this.state,
                    configuredRoleList: data.sort((a, b) => (a.role && b.role) && a.role> b.role? 1 : -1)
                })
            });
        }
    }

    render() {

        const { allowAny, textAny, name, disabled, section, customerId, value } = this.props;
        const { configuredRoleList } = this.state;

        let lookupList = lookupService.getList("LIST_ROLES", customerId, undefined, section).filter(RoleFilter);
        
        var configuredRoleLookup: LookupItem[] = [];
        configuredRoleList.forEach((configuredRole: PermissionConfig) => {
            var configuredRoleItem = lookupList.find((item: LookupItem) => configuredRole.role == item.value);
            if (configuredRoleItem != undefined) {
                configuredRoleLookup.push(configuredRoleItem);
            }
        })

        return (
            <Input disabled={disabled} type="select" value={value} name={name}
                onChange={this.handleChange}>
                <option value="" className="d-none"></option>
                {allowAny && <option value="any">{textAny && localise(textAny)}</option>}
                {configuredRoleLookup.map((l, key) => <option value={l.value} key={key}>{l.text}</option>)}
            </Input>
        )

    }

}



// WEBPACK FOOTER //
// ./src/modules/security/components/ConfiguredRoleDropDown/ConfiguredRoleDropDown.tsx