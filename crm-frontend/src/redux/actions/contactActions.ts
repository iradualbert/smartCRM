import axios from "axios";
import store from "../store";
import { ADD_CATEGORY, SET_CATEGORIES, SET_CONTACTS } from "../types";

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
        return err
    }
}

export const createCategory = async (data: object) => {
    try {
        const res = await axios.post(contactAPI.CONTACT_CATEGORIES, data);
        dispatch({
            type: ADD_CATEGORY,
            payload: res.data
        })
    } catch(err){
        return err.response?.data || {}
    }
}
