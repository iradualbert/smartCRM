import { ADD_CATEGORY, ADD_CONTACT, ADD_CONTACTS_MANY, SET_CATEGORIES, SET_CONTACTS } from "../types";


const initialState = {
    all_contacts: {
        results: [],
    },
    categories: [],
}

type TACtion = {
    type: string,
    payload: object | object[]

}

export default function (state = initialState, action: TACtion) {
    const actionType = action.type;
    const { all_contacts : { count=0 } } = state; 

    if (actionType === ADD_CONTACT)
        return {
            ...state,
            all_contacts: {
                ...state.all_contacts,
                results: [action.payload, ...state.all_contacts.results]
            }
        }
    else if (actionType === ADD_CONTACTS_MANY)
        return {
            ...state,
            all_contacts: {
                ...state.all_contacts,
                count: count + action.payload.length, 
                results: [...<[]>action.payload, ...state.all_contacts.results]
            }
        }
    else if (actionType === SET_CONTACTS)
        return {
            ...state,
            all_contacts: action.payload
        }

    else if (actionType === SET_CATEGORIES)
        return {
            ...state,
            categories: action.payload
        }
    else if (actionType === ADD_CATEGORY)
        return {
            ...state,
            categories: [action.payload, ...state.categories]
        }

    return state

}