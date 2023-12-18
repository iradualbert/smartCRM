import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import UserReducer from "./reducers/userReducer";
import rootReducer from "./reducers/rootReducer";

const initialState = {};
const middleware = [thunk]

const reducers = combineReducers({
    root: rootReducer,
    user: UserReducer,
})

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));
const store = createStore(reducers, initialState, enhancer);

export default store;