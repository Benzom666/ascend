import React from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

import Utils from "../../utility/index.js";
import { getUserList } from "./action.js";
import { SearchDropdownSet } from "./Component";

function VerifyPhotoCards({ UserPostList, status, noAction = false }) {
  const dispatch = useDispatch();
  const { per_page } = useSelector(
    (state) => state.userListReducer
  );
  const searchHandler = _.debounce((e) => {
    dispatch({
      type: Utils.ActionName.USER_LIST,
      payload: { search: e.target.value, userlist: [] },
    });
    dispatch(getUserList(status));
  }, 1000);
  return (
    <>
      <SearchDropdownSet
        per_page={per_page}
        searchHandler={searchHandler}
        status={status}
        getFunc={getUserList}
        payload={{ userlist: [] }}
      />
      <div className="userPostListBox">{UserPostList}</div>
    </>
  );
}

export default VerifyPhotoCards;
