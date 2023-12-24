import { SHOW_TOAST, CLEAR_TOAST } from "../types";


const initialState = {
	toasts: []
}

const uiReducer = (state = initialState, action) => {
	switch (action.type) {
		case SHOW_TOAST:
			return {
				...state,
				toasts: [...state.toasts, action.payload]
			};
        case CLEAR_TOAST:
            return {
                ...state,
                toasts: state.toasts.filter(toast => toast.id !== action.payload)
            }
		default:
			return state;
	}
};

export default uiReducer;