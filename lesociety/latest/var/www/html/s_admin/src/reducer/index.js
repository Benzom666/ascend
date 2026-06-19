import { combineReducers } from "redux";

// import { signInReducer } from "../screens/login/reducer";
import { userListReducer } from "../pages/pageContainer/reducer";
/**
 * combine all reducer into single root reducer
 */
const rootReducer = combineReducers({
  userListReducer: userListReducer,
  //   signInReducer,
});

export default rootReducer;
