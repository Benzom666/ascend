import React, { useEffect, useState, useRef, useCallback } from "react";
import SideBar from "../sideBar/sidebar.js";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

import PageHeader from "../pageContainer/header";
import {
  getDefaultMsgList,
  getUserList,
  getUserStatusCounter,
} from "./action.js";
import DataTablePagination from "./DataTablePagination.js";
import { Navigate } from "react-router-dom";

const PostList = React.memo(function (props) {
  const dispatch = useDispatch();
  const { userlist } = useSelector((state) => state.userListReducer);
  const [endUser, setEndUser] = useState("");

  useEffect(() => {
    dispatch({
      type: "USER_LIST",
      payload: { tab: 2, search: "", per_page: 10, userlist: [] },
    });
    dispatch(getUserList(5, 1));
    dispatch(getUserStatusCounter());
    dispatch(getDefaultMsgList("userRequestType"));
  }, []);
  const token = localStorage.getItem("accessToken");
  if(!token) {
    return <Navigate to="/" replace={true} />;
  }
  return (
    <div className="dashboardUi">
      <SideBar />
      <div className="inner-page userListUI">
        <PageHeader title="Verify Photo" />
        <DataTablePagination data={userlist} setEndUser={setEndUser} />
        <p className="text-danger">{endUser}</p>
      </div>
    </div>
  );
});

export default PostList;
