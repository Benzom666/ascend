import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Nav, Tab, Form, Card, Toast, Button } from "react-bootstrap";
import _ from "lodash";
import moment from "moment";

import SideBar from "../sideBar/sidebar.js";
import LocationIcon from "../../assets/images/location.svg";
import BrunchDateSvg from "../../assets/images/brunchDate.svg"
import EveningDateSvg from "../../assets/images/eveningDate.svg";
import GetSportySvg from "../../assets/images/getReady.svg";
import TakeAClassSvg from "../../assets/images/takeAClass.svg";
import EntertainmentAndSportsSvg from "../../assets/images/entertainmentAndSports.svg";
import WineAndDineSvg from "../../assets/images/wineAndDine.svg";
import BottlesAndDanceSvg from "../../assets/images/bottlesAndDance.svg";

import { MdOutlineRotate90DegreesCcw } from "react-icons/md";
import PageHeader from "../pageContainer/header";
import {
  getDefaultMsgList,
  postSendDefaulMsg,
  getAllDates,
  getDateStats,
  postUpdateDateStatus,
  postRemove,
} from "./action.js";
import { DefaultMsg } from "./DefaultMsg";
import Utils from "../../utility/index.js";
import { NavItemSet, SearchDropdownSet } from "./Component";

const DATE_TYPE_ICONS = {
  "Brunch Date": BrunchDateSvg,
  "Evening Date": EveningDateSvg,
  "Get Sporty": GetSportySvg,
  "Take A Class": TakeAClassSvg,
  "Entertainment & Sports": EntertainmentAndSportsSvg,
  "Wine & Dine": WineAndDineSvg,
  "Bottles & Dance": BottlesAndDanceSvg
}

function PostList() {
  const dispatch = useDispatch();
  const { per_page, datesList, defaultMsg, datesCont, datesStats, loading, isAPISuccess } =
    useSelector((state) => state.userListReducer);
  const [show, setShow] = useState(false);
  const [msgType, setMsgType] = useState("");
  const [emailSelected, setEmailSelected] = useState([]);
  const [postIdSelected, setPostIdSelected] = useState([]);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [showA, setShowA] = useState(true);
  const toggleShowA = () => setShowA(!showA);
  const [isActive, setIsActive] = useState(true);
  const [saveId, setSaveId] = useState();
  const [endUser, setEndUser] = useState();
  const [page, setPage] = useState(2);
  const [status, setStatus] = useState("");

  useEffect(() => {
    dispatch({
      type: Utils.ActionName.USER_LIST,
      payload: { tab: 1, search: "", per_page: 10, datesList: [] },
    })
    dispatch(getAllDates(status, 1, ""));
    dispatch(getDefaultMsgList("postMessage"));
    dispatch(getDateStats());
  }, []);
  const  msgSubmit = () => {
    dispatch(postSendDefaulMsg("postMessage", 0, emailSelected, postIdSelected, status, "dates"));
    setShow(false);
  };
  const observer = useRef();
  const lastPostElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && datesCont.total_pages >= page) {
        dispatch(getAllDates(status, page, ""));
        setPage(page + 1);
      } else {
        setEndUser("End of page");
      }
    });
    if (node) observer.current.observe(node);
  });
  const searchHandler = _.debounce((e) => {
    dispatch({
      type: Utils.ActionName.USER_LIST,
      payload: { search: e.target.value },
    });
    dispatch(getAllDates(status, 1, ""));
  }, 1000);
  const checkedUser = (event) => {
    if(event.target.checked){
      setEmailSelected([...emailSelected, event.target.value]);
      setPostIdSelected([...postIdSelected, event.target.id]);
    } else {
      emailSelected.splice(emailSelected.indexOf(event.target.value), 1);
      setEmailSelected(emailSelected); 
      postIdSelected.splice(postIdSelected.indexOf(event.target.value), 1);
      setPostIdSelected(postIdSelected); 
    }
    console.log(emailSelected)
  };
  const UserPostList =
    Array.isArray(datesList) && datesList.length ? (
      datesList.map((value, index) => {
        return (
          <Card
            className="bg-dark text-white"
            key={value.id}
            ref={datesList.length === index + 1 ? lastPostElementRef : null}
          >
            <div className="cardActionBox">
              <Form.Check
                className="checkboxUI"
                type="checkbox"
                value={value?.user_data[0]?.email}
                id={value?._id}
                onClick={checkedUser}
//                 checked={postIdSelected.includes(value?._id)}
                disabled={status === 6}
              />
              <Card.Link
                className="showDetail"
                onClick={(e) => {
                  setIsActive(!isActive);
                  setSaveId(saveId !== value?._id ? value?._id : "");
                }}
              >
                <MdOutlineRotate90DegreesCcw />
              </Card.Link>
            </div>

            {saveId === value?._id ? (
              <>
                {value?.user_data.map((userDetail, index) => (
                  // "Hello"
                  <Card.Img
                    key={index}
                    src={userDetail?.images[0]}
                    alt="Card image"
                  />
                ))}
                <Card.ImgOverlay>
                  <Card.Title>
                    {value?.user_name},{" "}
                    <span>
                      {" "}
                      {value?.user_data.map(
                        (userDetail) => userDetail?.age
                      )}{" "}
                    </span>
                  </Card.Title>
                  <div className="mb-3 mt-3 d-flex justify-content-between align-items-end">
                    <Card.Subtitle>
                      <img src={LocationIcon} />
                      {value?.location}, {value?.province}
                    </Card.Subtitle>
                    <Card.Text>
                      ${value?.price} / <span> {value?.date_length} </span>
                    </Card.Text>
                  </div>
                  <Card.Link href="#" className="date-type-badge">
                    <img src={DATE_TYPE_ICONS[(value?.middle_class_dates ||
                      value?.standard_class_date ||
                      value?.executive_class_dates || '').trim()] || DATE_TYPE_ICONS['Get Sporty']} alt="" className="date-type-icon"/>{" "}
                    <span>{value?.middle_class_dates ||
                      value?.standard_class_date ||
                      value?.executive_class_dates}</span>
                  </Card.Link>
                </Card.ImgOverlay>
              </>
            ) : (
              <Card.Body className={`posterDetails r-spacing posterDetailShow`}>
                <div className="y-scroll post-cont-spacing">
                  <h3 className="date-card-type-title"> {(value?.middle_class_dates ||
                      value?.standard_class_date ||
                      value?.executive_class_dates || '').trim()} </h3>
                  <p style={{'maxWidth': '200px'}}>{value?.date_details}</p>
                  {value?.warning_sent_date  && status === 6?
                  <p className="warned-date">Warned date:  {moment(value?.warning_sent_date).format("DD/MM/YYYY")}</p> : ""}
                </div>
              </Card.Body>
            )}
          </Card>
        );
      })
    ) : (
      <div className="text-danger">No dates found.</div>
    );
  const paylaod1 = { datesList: [] };
  useEffect(() => {
    if(isAPISuccess) {
      setPostIdSelected([]);
      setEmailSelected([]);
      dispatch({
        type: Utils.ActionName.USER_LIST,
        payload: { isAPISuccess: false },
      });
    }
  }, [isAPISuccess])
  return (
    <div className="dashboardUi">
      <SideBar />
      <div className="inner-page userListUI">
        <PageHeader title="Posts" />
        <Tab.Container defaultActiveKey="link-1">
          <Nav variant="tabs">
            <NavItemSet
              eventKey="link-1"
              status=""
              badge={datesStats?.total_dates}
              setStatus={setStatus}
              title="Total Posts"
              setPage={setPage}
              payload={{ tab: 1, search: "", per_page: 10, datesList: [] }}
              getFunc={getAllDates}
            />
            <NavItemSet
              eventKey="link-2"
              status={5}
              badge={datesStats?.new_dates}
              setStatus={setStatus}
              title="New"
              setPage={setPage}
              payload={{ tab: 5, search: "",  datesList: [] }}
              getFunc={getAllDates}
            />
            {/* <NavItemSet
              eventKey="link-4"
              status={6}
              badge={datesStats?.warned_dates}
              setStatus={setStatus}
              title="Warned"
              setPage={setPage}
              payload={{ tab: 6, search: "",  datesList: [] }}
              getFunc={getAllDates}
            />
            <NavItemSet
              eventKey="link-5"
              status={7}
              badge={datesStats?.re_submitted_dates}
              setStatus={setStatus}
              title="Resubmitted"
              setPage={setPage}
              payload={{ tab: 7, search: "", datesList: [] }}
              getFunc={getAllDates}
            /> */}
            {/* <NavItemSet
              eventKey="link-3"
              status={3}
              badge={datesStats?.deactivated_dates}
              setStatus={setStatus}
              title="Blocked"
              setPage={setPage}
              payload={{ tab: 3, search: "", datesList: [] }}
              getFunc={getAllDates}
            /> */}
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="link-1">
              <SearchDropdownSet
                per_page={per_page}
                searchHandler={searchHandler}
                status={status}
                getFunc={getAllDates}
                payload={paylaod1}
              />
              {!status ? (
                <div className="userPostListBox">
                  {UserPostList}
                  <p className="text-danger">{endUser}</p>
                </div>
              ) : null}
            </Tab.Pane>
            <Tab.Pane eventKey="link-2">
              <SearchDropdownSet
                per_page={per_page}
                searchHandler={searchHandler}
                status={status}
                getFunc={getAllDates}
                payload={paylaod1}
              />
              {status === 5 ? (
                <div className="userPostListBox">{UserPostList}</div>
              ) : null}
            </Tab.Pane>
            {/* <Tab.Pane eventKey="link-4">
              <SearchDropdownSet
                per_page={per_page}
                searchHandler={searchHandler}
                status={status}
                getFunc={getAllDates}
                payload={paylaod1}
              />
              {status === 6 ? (
                <div className="userPostListBox">{UserPostList}</div>
              ) : null}
            </Tab.Pane> */}
            {/* <Tab.Pane eventKey="link-5">
              <SearchDropdownSet
                per_page={per_page}
                searchHandler={searchHandler}
                status={status}
                getFunc={getAllDates}
                payload={paylaod1}
              />
              {status === 7 ? (
                <div className="userPostListBox">{UserPostList}</div>
              ) : null}
            </Tab.Pane> */}
            <Tab.Pane eventKey="link-3">
              <SearchDropdownSet
                per_page={per_page}
                searchHandler={searchHandler}
                status={status}
                getFunc={getAllDates}
                payload={paylaod1}
              />
              {status === 3 ? (
                <div className="userPostListBox">{UserPostList}</div>
              ) : null}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
        {emailSelected.length ? (<>
          {status && <Toast show={showA} onClose={toggleShowA} className="requestPopup" style={{bottom: '100px'}}>
            <Toast.Body className="d-flex align-items-center w-100 justify-content-center">
             <Form.Check type="checkbox" label="people" />
              <Button
                className="verifyBtn"
                onClick={() => {
                  dispatch(postRemove(3, postIdSelected, status));
                }}
              >
                Remove
              </Button>
            </Toast.Body>
          </Toast>}
          <Toast show={showA} onClose={toggleShowA} className="requestPopup">
            <Toast.Body className="d-flex align-items-center w-100 justify-content-center">
             <Form.Check type="checkbox" label="people" />
              {/*  <Button className="requestBtn" onClick={handleShow}>
                Request
              </Button> */}
              <Button
                className="verifyBtn"
                onClick={() => {
                  dispatch(postUpdateDateStatus(3, postIdSelected, status));
                }}
              >
                Block
              </Button>
            </Toast.Body>
          </Toast></>
        ): null}
      </div>
      <DefaultMsg
        defaultMsg={defaultMsg}
        show={show}
        setMsg={setMsgType}
        msgSubmit={msgSubmit}
        handleClose={handleClose}
      />
    </div>
  );
}

export default PostList;
