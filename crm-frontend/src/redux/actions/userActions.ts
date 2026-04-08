import axios from "axios";
import { SET_USER, SET_UNAUTHENTICATED, SET_TOKEN_VERIFIED, SET_COMPANIES } from "../types";

const api = {
    LOGIN: "/auth/login/",
    REGISTER_USER: "/auth/register/",
    GET_USER: "/auth/user",
    LOGOUT: "/auth/logout/",
    LOGOUT_ALL: "/auth/logoutall/",
	VERIFY_CODE: "/accounts/activate/code/",
	RESEND_CODE: "/accounts/activate/resend/",
	MEMBERSHIP_COMPANIES: "/companies/"
}

const config = {
	headers: {
		"Content-Type": "application/json",
	},
};

const saveToken = (token: string) => {
	axios.defaults.headers.common["Authorization"] = `Token ${token}`;
	localStorage.setItem("token", token);
};

const removeAuthToken = () => {
	delete axios.defaults.headers.common["Authorization"];
	localStorage.removeItem("token");
	return {
		type: SET_UNAUTHENTICATED,
	};
};

const setUser = (user: any) => {
	return {
		type: SET_USER,
		payload: user,
	};
};

export const loginUser =
	(userData: any, navigate: any, next: string) =>
	async (dispatch: any) => {
		try {
			const { data } = await axios.post(api.LOGIN, userData, config);
			const { user, token } = data;
			saveToken(token);
			dispatch(setUser(user));
			if(next) navigate(next) 
			else navigate("/dashboard");
			
		} catch (err: any) {
			if (err.response) {
				return err.response.data;
			}
			console.error(err);
		}
	};

export const registerUser = (userData: any, navigate: any) => async (dispatch: any) => {
	try {
		await axios.post(api.REGISTER_USER, userData, config);
		//const { data } = await axios.post(api.REGISTER_USER, userData, config);
		// saveToken(data.token);
		// dispatch(setUser(data.user));
		// navigate("/account/verification");
	} catch (err: any) {
		if (err.response) {
			return err.response.data;
		}
	}
};

export const verify_code = (userData: any, navigate:any) => async(dispatch: any) => {
	try{
		const { data } = await axios.post(api.VERIFY_CODE, userData, config);
		saveToken(data.token);
		dispatch(setUser(data.user));
		navigate("/settings/integration");
	} catch(err: any){
		if(err.response) return err.response.data;
	}
}

export const resend_verification_code = async (userData: any) => {
	try {
		await axios.post(api.RESEND_CODE, userData, config);
	} catch (err: any) {
		if (err.response) {
			return err.response.data;
		}
	}
}

export const getUser = () => async (dispatch: any) => {
	try {
		const { data } = await axios.get(api.GET_USER);
		dispatch(setUser(data));
		dispatch({ type: SET_TOKEN_VERIFIED });
	} catch (err: any) {
		if (err.response) {
			dispatch(removeAuthToken());
			dispatch({ type: SET_TOKEN_VERIFIED });
		}
	}
};

export const getMembershipOrganizations = () => async (dispatch: any) => {
	try {
		const {data } = await axios.get(api.MEMBERSHIP_COMPANIES);
		dispatch({type: SET_COMPANIES, payload: data.results});
	}
	catch(err: any){
		if (err.response) {
			console.error("Error fetching membership organizations:", err.response.data);
		} else {
			console.error("Error fetching membership organizations:", err);
		}
}
}	

export const logoutUser = () => {
	axios.post(api.LOGOUT)
		.then(() => {
			// dispatch(removeAuthToken());
			localStorage.removeItem('token');
			window.location.href = "/";
		})
	.catch(err => console.log(err))
};

export const logoutUserAll = () => {
	axios.post(api.LOGOUT_ALL)
	.then(() => {
		localStorage.removeItem('token');
	    window.location.href = "/";
	})
}


export const checkAuthToken = () => async (dispatch: any) => {
	const token = localStorage.getItem("token");
	if (token) {
		axios.defaults.headers.common["Authorization"] = `Token ${token}`;
		dispatch(getUser());
		dispatch(getMembershipOrganizations());
	} else {
		dispatch({ type: SET_TOKEN_VERIFIED });
	}
};