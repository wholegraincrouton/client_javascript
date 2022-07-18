import * as React from 'react';
import { connect } from 'react-redux';
import { PulseLoader } from 'react-spinners';

import { StoreState } from "src/redux/store"

import './global-spinner.css';

export interface SpinnerProps {
    pendingRequestCount: number
}

const GlobalSpinner = ({ pendingRequestCount }: SpinnerProps) => {
    var loading = (pendingRequestCount > 0);
    if (!loading)
        return null;

    return (
        <div id="spinner" className='spinner-panel spinner'>
            <PulseLoader
                sizeUnit={"px"}
                size={15}
                color={'#17a2b8'}
                loading={loading}
            />
        </div>
    );
}

const mapStateToProps = (state: StoreState) => ({ ...state.spinner });

export default connect(mapStateToProps)(GlobalSpinner);




// WEBPACK FOOTER //
// ./src/modules/shared/components/GlobalSpinner/GlobalSpinner.tsx