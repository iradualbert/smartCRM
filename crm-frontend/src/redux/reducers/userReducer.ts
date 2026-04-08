import * as Types from "../types";

const initialState = {
    isAuthenticated: false,
    isLoading: true,
    credentials: {},
    organizations: []
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
        case Types.SET_TOKEN_VERIFIED:
            return {
                ...state,
                isLoading: false,
            }
        case Types.SET_EMAIL_PROVIDER:
            return {
                ...state,
                credentials: {
                    ...state.credentials,
                    config: {
                        email_provider: action.payload
                    }
                }
            }

        case Types.SET_COMPANIES:
            return {
                ...state,
                organizations: action.payload
            }
        case Types.ADD_COMPANY:
            return {
                ...state,
                organizations: [...state.organizations, action.payload]
            }
        
        case Types.REMOVE_COMPANY:
            return {
                ...state,
                organizations: state.organizations.filter((org: any) => org.id !== action.payload)
            }
        default:
            return state
    }
}