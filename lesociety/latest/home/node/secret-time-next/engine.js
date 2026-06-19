import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { combineReducers } from "redux";
import { all } from "redux-saga/effects";
import { reducer as reduxFormReducer } from 'redux-form';
import authReducer from "./modules/auth/authReducer";
import { composeWithDevTools } from 'redux-devtools-extension'
const reducers = { authReducer, form: reduxFormReducer };
const sagasAll = [];

process.env.modules.map( (active, index) => {
  const reducer = require(`modules/${active}/${active}Reducer.js`).default;
  const saga = require(`modules/${active}/${active}Sagas.js`).default;
  
  sagasAll.push(saga());
  reducers[reducer.name] = reducer;
});

const sagas = function* rootSaga() { 
   yield all(sagasAll);
} 

const sagaMiddleware = createSagaMiddleware();

const bindMiddleware = middleware => {
  let arrMiddleware = [middleware];

  if (process.env.NODE_ENV !== "production") {
    const { createLogger }  = require( 'redux-logger' );
    arrMiddleware.push(createLogger());
    return applyMiddleware(...arrMiddleware);
  }
  return applyMiddleware(...arrMiddleware);
};

function configureStore() {
  const store = createStore(combineReducers(reducers), composeWithDevTools(bindMiddleware(sagaMiddleware)));

  store.runSagaTask = () => {
    store.sagaTask = sagaMiddleware.run(sagas);
  };

  store.runSagaTask();

  return store;
}


export default configureStore;