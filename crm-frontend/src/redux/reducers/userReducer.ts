import * as Types from "../types";

const initialState = {
    isAuthenticated: false,
    isLoading: false,
    credentials: {},
}

export default function (state = initialState, action:{ type: string, payload?: object}) {
    switch (action.type) {
        case Types.SET_AUTHENTICATED:
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
            }    
        case Types.SET_UNAUTHENTICATED:
            return initialState;
        case Types.SET_USER:
            return {
                ...state,
                isAuthenticated: true,
                credentials: action.payload,
                isLoading: false,
            }
        case Types.LOADING_USER:
            return {
                ...state,
                isLoading: true,
            }
        default:
            return state
    }
}