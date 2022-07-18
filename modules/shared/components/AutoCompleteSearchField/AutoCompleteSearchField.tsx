import * as React from "react";
import { localise } from "../../services";
import { AutoComplete } from "@progress/kendo-react-dropdowns";

interface Props {
    onChange?: (event?: any) => void;
    onBlur?: (event?: any) => void;
    name: string;
    value: string;
    data: string[];
}

export default class AutoCompleteSearchField extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyBlur = this.handleKeyBlur.bind(this);
        this.listNoDataRender = this.listNoDataRender.bind(this);
        this.filterData = this.filterData.bind(this);

        this.state = {
            value: '',
            filteredData: []
        };
    }

    handleChange(event: any) {       
        this.props.onChange && this.props.onChange(event);       
    }

    handleKeyBlur(event: any) {
        this.props.onBlur && this.props.onBlur(event);
    }

    listNoDataRender = (element: any) => {
        const noData = (
            localise("TEXT_NO_DATA_FOUND")
        );

        return React.cloneElement(element, { ...element.props }, noData);
    }

    filterData(value: string) {
        const dataList = this.props.data;
        let filteredData = dataList.filter(d => d != undefined &&  d.toLowerCase().includes(value.toLowerCase()));
        return Array.from(new Set(filteredData));
    }

    render() {        
        let filteredData = this.filterData(this.props.value);       
        let selectedValue;
        
        if (this.props.value) {
            selectedValue = this.props.data.find(d => d == this.props.value);          
        }

        return (
            <AutoComplete data={filteredData} style={{ width: "100%", fontSize: 14 }} name={this.props.name} popupSettings={{ className: "suggestions-container" }} 
            value={selectedValue || this.props.value} listNoDataRender={this.listNoDataRender} onChange={this.handleChange} onBlur={this.handleKeyBlur} />
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField.tsx