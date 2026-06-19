import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import authReducer from "./authReducer";
import { reducersForm } from "./authReducer";

const reducers = combineReducers({ auth: authReducer, form: reducersForm });

export const initStore = (initialState = {}) => {
  const middlewares = [thunkMiddleware];
  
  // Only use redux-logger in development mode
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const logger = require('redux-logger').default;
    middlewares.push(logger);
  }

  return createStore(
    reducers,
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
  );
};
