import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from 'src/modules/shared/services';

export function PermissionExistLookupCell(key: string){
    return class extends React.Component<GridCellProps> {
        yesText = lookupService.getText("LIST_BOOLEAN_FLAGS", "YES");
        noText = lookupService.getText("LIST_BOOLEAN_FLAGS", "NO");
        constructor(props: GridCellProps) {
            super(props);
        }

        isPermissionExist(){
            let permissionList = this.props.dataItem["permissions"];
            let specificPermissionList = lookupService.getList(key);
            
            let isExist =false;
            for (let specificPermission of specificPermissionList) {
                let isSpecificPermissionExist = permissionList.find((item:string) => item ==  specificPermission.value);
                
                if(isSpecificPermissionExist != undefined){
                    isExist = true;
                    break;
                }
            }
            return isExist; 
        }

        render(){
            let isPermissionExist =this.isPermissionExist();           
            return(
                
            <td>
                {isPermissionExist == true ?  this.yesText: this.noText}
            </td>
            );    
        }
    }

}


// WEBPACK FOOTER //
// ./src/modules/security/components/PermissionExistLookupCell/PermissionExistLookupCell.tsx