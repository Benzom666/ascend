import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import RootReducer from "../reducer";

const enhancer = compose(applyMiddleware(thunk, logger));
/**
 * create new store
 */
const store = createStore(RootReducer, enhancer);
export default store;
