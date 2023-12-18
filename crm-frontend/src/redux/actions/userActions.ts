import axios from "axios";
import { SET_USER, SET_UNAUTHENTICATED, SET_TOKEN_VERIFIED } from "../types";

const api = {
    LOGIN: "/auth/login/",
    REGISTER_USER: "/auth/register/",
    GET_USER: "/auth/user",
    LOGOUT: "/auth/logout/",
    LOGOUT_ALL: "/auth/logoutall/",
}

const config = {
	headers: {
		"Content-Type": "application/json",
	},
};

const saveToken = (token) => {
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

const setUser = (user) => {
	return {
		type: SET_USER,
		payload: user,
	};
};

export const loginUser =
	(userData, navigate, next) =>
	async (dispatch) => {
		try {
			const { data } = await axios.post(api.LOGIN, userData, config);
			const { user, token } = data;
			saveToken(token);
			dispatch(setUser(user));
			navigate(next || "/");
		} catch (err) {
			if (err.response) {
				return err.response.data;
			}
			console.error(err);
		}
	};

export const registerUser = (userData, navigate) => async (dispatch) => {
	try {
		const { data } = await axios.post(api.REGISTER_USER, userData, config);
		saveToken(data.token);
		dispatch(setUser(data.user));
		navigate("/account/verification");
	} catch (err) {
		if (err.response) {
			return err.response.data;
		}
		console.log(err);
	}
};

export const getUser = () => async (dispatch) => {
	try {
		const { data } = await axios.get(api.GET_USER);
		dispatch(setUser(data));
		dispatch({ type: SET_TOKEN_VERIFIED });
	} catch (err) {
		if (err.response) {
			dispatch(removeAuthToken());
			dispatch({ type: SET_TOKEN_VERIFIED });
		}
		console.log(err);
	}
};

export const logoutUser = () => {
	axios.post(api.LOGOUT)
		.then(() => {
			// dispatch(removeAuthToken());
			localStorage.removeItem('token');
			window.location.reload();
		})
	.catch(err => console.log(err))
};

export const checkAuthToken = () => async (dispatch) => {
	const token = localStorage.getItem("token");
	if (token) {
		axios.defaults.headers.common["Authorization"] = `Token ${token}`;
		dispatch(getUser());
	} else {
		dispatch({ type: SET_TOKEN_VERIFIED });
	}
};