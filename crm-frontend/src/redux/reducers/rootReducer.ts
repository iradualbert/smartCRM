import * as Types from "../types";

const initialState = {
	isTokenVerified: false
};

const rootReducer = (state = initialState, action) => {
	switch (action.type) {
		case Types.SET_TOKEN_VERIFIED:
			return {
				...state,
				isTokenVerified: true,
			};
		default:
			return state;
	}
};

export default rootReducer;