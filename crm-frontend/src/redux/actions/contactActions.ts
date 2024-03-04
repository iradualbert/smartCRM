import axios from "axios";
import store from "../store";
import { SET_CATEGORIES, SET_CONTACTS } from "../types";

const dispatch = store.dispatch;

const contactAPI = {
    CONTACT_CATEGORIES: "/contact-categories/"
}

export const getContacts = async () => {
    try {
        const res = await axios.get('/contacts/')
        dispatch({
            type: SET_CONTACTS,
            payload: res.data
        })
        return res.data
    }
    catch(err){

    }
}

export const getCategories = async () => {
    try {
        const res = await axios.get(contactAPI.CONTACT_CATEGORIES);
        dispatch({
            type:  SET_CATEGORIES,
            payload: res.data.results
        })
        return res.data.results
    } catch(err){

    }
}
