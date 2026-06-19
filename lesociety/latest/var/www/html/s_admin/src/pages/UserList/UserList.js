import React, { useEffect, useState, useRef, useCallback } from "react";
import { Nav, Tab } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import "./UserList.css"

import SideBar from "../sideBar/sidebar.js";
import UserTable from "./UserTable.js";
import {
  getUserList,
  getUserStatusCounter,
  getDefaultMsgList
} from "../pageContainer/action";
import Utils from "../../utility/index.js";
import PageHeader from "../pageContainer/header";
import { NavItemSet, SearchDropdownSet } from "../pageContainer/Component";
import { Navigate, useNavigate, useLocation, useSearchParams } from "react-router-dom";

function UserList() {
  const dispatch = useDispatch();
  const { pagination, tab, search, usersAdminStatus, loading } = useSelector(
    (state) => state.userListReducer
  );
  const [endUser, setEndUser] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const _PAGE = useSelector((e) => e?.userListReducer?.page);
  const TAB_LINK_MAP = {
    'total-users': 'link-1',
    'verified-users': 'link-2',
    'pending-verification': 'link-3',
    'details': 'link-4',
    'updated-details': 'link-5',
  }

  const LINK_STATUS_MAP = {
    'link-1': '',
    'link-2': 2,
    'link-3': 1,
    'link-4': 6,
    'link-5': 10,
  }

  const getSelectedTabFromURL = () => {
    return TAB_LINK_MAP[urlParams.get('tab')]
  };

  const [selectedTab, setSelectedTab] = useState(
    getSelectedTabFromURL() || localStorage.getItem('selectedTab') || 'link-1'
  );

  useEffect(() => {
    localStorage.setItem('selectedTab', selectedTab);
    setStatus(LINK_STATUS_MAP[selectedTab])
    urlParams.set('tab', findTabNameByLink(selectedTab));

    for (const param of urlParams.entries()) {
      if (param[0] !== 'tab') {
        urlParams.set(param[0], param[1]);
      }
    }

    navigate(`?${urlParams.toString()}`);
    // dispatch(getUserList("", localStorage.getItem(`page${selectedTab}`) || 1));
    // setPage(localStorage.getItem(`page${selectedTab}`) || 1);
  }, [selectedTab]);

  const findTabNameByLink = (value) => {
    return Object.keys(TAB_LINK_MAP).find((key) => TAB_LINK_MAP[key] === value);
  };

  const handleTabSelect = (tabKey) => {
    setSelectedTab(tabKey);
  };

  useEffect(() => {
    dispatch({
      type: Utils.ActionName.USER_LIST,
      payload: { tab: 1, search: "", per_page: 10, userlist: [] }
    });
    dispatch(getUserList(
      selectedTab === "link-2" ? 2 : selectedTab === "link-3" ? 1 : selectedTab === "link-4" ? 6 : ""
      , _PAGE));
    // setPage(localStorage.getItem(`page${selectedTab}`) || 1);
    dispatch(getUserStatusCounter());
    dispatch(getDefaultMsgList("userRequestType"));
  }, []);

  // useEffect(()=>{
  //   localStorage.setItem(`page${selectedTab}`, page);
  // }, [page])

  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    // if(loading) return;
    // if(observer.current) observer.current.disconnect();
    // observer.current = new IntersectionObserver(entries => {
    //   if(entries[0].isIntersecting && pagination.total_pages >= page) {
    //     dispatch(getUserList(status, page));
    //     setPage(page+1);
    //   }
    //   else {
    //     setEndUser("End of page");
    //   }
    // });
    // if(node) observer.current.observe(node);
  });

  const navigatePage = (pageNo) => {
    if(pageNo >0 && pageNo <=pagination.total_pages)
    {
      dispatch(getUserList(status, pageNo));
      dispatch({
        type: "SET_PAGE",
        payload: {
          page: pageNo,
        },
      });
      // setPage(pageNo);
    }
  }

  const token = localStorage.getItem("accessToken");
  if(!token) {
    return <Navigate to="/" replace={true} />;
  }
  return (
    <div className="dashboardUi">
      <SideBar />
      <div className="inner-page userListUI">
        <PageHeader title="Users list" />
        <Tab.Container defaultActiveKey={selectedTab} onSelect={handleTabSelect}>
          <Nav variant="tabs">
            <NavItemSet
              eventKey="link-1"
              dispatch={dispatch}
              status=""
              badge={usersAdminStatus?.total_users}
              setStatus={setStatus}
              title="Total Users"
              // setPage={setPage}
              payload={{ tab: 1, search: "", per_page: 10, userlist: [] }}
              getFunc={getUserList}
            />
            <NavItemSet
              eventKey="link-2"
              status={2}
              badge={usersAdminStatus?.verified_users}
              setStatus={setStatus}
              title="Verified Users"
              // setPage={setPage}
              payload={{ tab: 1, search: "", per_page: 10, userlist: [] }}
              getFunc={getUserList}
            />
            <NavItemSet
              eventKey="link-3"
              status={1}
              badge={usersAdminStatus?.pending_users}
              setStatus={setStatus}
              title="Pending Verification"
              // setPage={setPage}
              payload={{ tab: 3, search: "", per_page: 10, userlist: [] }}
              getFunc={getUserList}
            />
            <NavItemSet
              eventKey="link-4"
              status={6}
              badge={usersAdminStatus?.requested_by_admin}
              setStatus={setStatus}
              title="Details(Requested by admin)"
              // setPage={setPage}
              payload={{ tab: 3, search: "", per_page: 10, userlist: [] }}
              getFunc={getUserList}
            />
            <NavItemSet
              eventKey="link-5"
              status={10}
              badge={usersAdminStatus?.updated_details}
              setStatus={setStatus}
              title="Updated Details"
              // setPage={setPage}
              payload={{ tab: 3, search: "", per_page: 10, userlist: [] }}
              getFunc={getUserList}
            />
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="link-1">
            {!status ? <UserTable endUser={endUser} lastPostElementRef={lastPostElementRef} status={status}/> : null}
            </Tab.Pane>
            <Tab.Pane eventKey="link-2">{status === 2 ? <UserTable endUser={endUser} lastPostElementRef={lastPostElementRef} status={status} /> : null}</Tab.Pane>
            <Tab.Pane eventKey="link-3">{status === 1 ? <UserTable endUser={endUser} lastPostElementRef={lastPostElementRef} status={status} /> : null}</Tab.Pane>
            <Tab.Pane eventKey="link-4">{status === 6 ? <UserTable endUser={endUser} lastPostElementRef={lastPostElementRef} status={status} noAction={true} /> : null}</Tab.Pane>
            <Tab.Pane eventKey="link-5">{status === 10 ? <UserTable endUser={endUser} lastPostElementRef={lastPostElementRef} status={status} /> : null}</Tab.Pane>
          </Tab.Content>
        </Tab.Container>
        <div className="pagination-container">
          {1}
          <span className="pagination-button" onClick={()=>{navigatePage(1)}}>First</span>
          <span className="pagination-button" onClick={()=>{navigatePage(_PAGE - 5)}}>{`<<`}</span>
          <span className="pagination-button" onClick={()=>{navigatePage(_PAGE - 1)}}>Pre</span>
          <span className="pagination-button">{_PAGE}</span>
          <span className="pagination-button" onClick={()=>{navigatePage(_PAGE + 1)}}>Next</span>
          <span className="pagination-button" onClick={()=>{navigatePage(_PAGE + 5)}}>{`>>`}</span>
          <span className="pagination-button" onClick={()=>{navigatePage(pagination.total_pages)}}>Last</span>
          {pagination.total_pages}
        </div>
       <p className="text-danger">{endUser}</p>
      </div>
    </div>
  );
}

export default UserList;
