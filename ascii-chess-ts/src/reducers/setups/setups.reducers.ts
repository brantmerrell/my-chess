import { SET_SELECTED_SETUP } from './setups.actions';
import { AnyAction } from 'redux';

const initialState = ''; // or set a default value if needed

export const selectedSetupReducer = (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case SET_SELECTED_SETUP:
            const newState = action.payload;
            return newState;
        default:
            return state;
    }
};
