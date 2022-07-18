import * as React from "react";
import { LookupItem } from "src/modules/shared/types/dto";
import { lookupService } from "../../services";
import Label from "reactstrap/lib/Label";
import Input from "reactstrap/lib/Input";

interface Props {
    lookupKey: string;
    disabled?: boolean;
    selectedList?: string[];
    onCheckBoxChange?: (selcetedList: string[]) => void;
}

interface State {
    list: LookupItem[];
    selectedList: string[]
}
export default class LookupCheckList extends React.Component<Props, State> {
    itemSlotFieldList?: JSX.Element[] = undefined;

    constructor(props: Props) {
        super(props);
        this.state = {
            list: [], selectedList: this.props.selectedList == undefined
                ? [] : this.props.selectedList
        };
        this.onCheckBoxChange = this.onCheckBoxChange.bind(this);
    }

    onCheckBoxChange(event: any) {
        var selectedItem = event.target.value;
        var list = this.state.selectedList;
        var index = list.indexOf(selectedItem)
        if (index > -1) {
            list.splice(index, 1);
        }
        else {
            list.push(selectedItem);
        }
        this.setState({ ...this.state, selectedList: list })
        this.props.onCheckBoxChange && this.props.onCheckBoxChange(this.state.selectedList)
    }

    componentDidMount() {
        var days = lookupService.getList(this.props.lookupKey);
        days.sort(function (a: LookupItem, b: LookupItem) {
            return (a.sortOrder == undefined ? 0 : a.sortOrder) - (b.sortOrder == undefined ? 0 : b.sortOrder)
        });

        this.setState({ list: days });
    }

    getCheckBoxState(value?: string) {
        return this.state.selectedList.indexOf(value == undefined ? '' : value) > -1;
    }

    render() {
        const { disabled } = this.props;
        const pStyle = {
            marginRight: '15px'
        };
        const list = this.state.list;
        const checkList = list.map((lookupItem) =>
            <Label style={pStyle} check key={'label' + lookupItem.value} for={lookupItem.value}>
                <Input type="checkbox" onChange={this.onCheckBoxChange} id={lookupItem.value}
                    name={lookupItem.value} checked={this.getCheckBoxState(lookupItem.value)} value={lookupItem.value} disabled={disabled}/>
                {lookupItem.text}
            </Label>

        );

        return (
            <div>
                {checkList}
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/LookupCheckList/LookupCheckList.tsx