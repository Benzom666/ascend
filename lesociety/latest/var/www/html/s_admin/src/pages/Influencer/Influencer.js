import React, { useEffect, useState, useRef, useCallback } from "react";
import _ from "lodash";
import {
  Nav,
  Tab,
  Badge,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import SideBar from "../sideBar/sidebar.js";
import {
  getInfluencer,
  getInfluencerEmailExists,
  getInfluencerExistCode,
  getInfluencerStats,
  influencerCreate,
} from "../pageContainer/action";
import PageHeader from "../pageContainer/header";
import InfluencersList from "./InfluencerTable";
import Utils from "../../utility/index.js";
import { NavItemSet, SearchDropdownSet } from "../pageContainer/Component";

function InfluencerPage() {
  const dispatch = useDispatch();
  const {
    influencerStats,
    existEmail,
    existEmailScuse,
    existCodeMsg,
    existCode,
    loading,
    pagination,
  } = useSelector((state) => state.userListReducer);
  const [endUser, setEndUser] = useState();

  useEffect(() => {
    dispatch({
      type: Utils.ActionName.USER_LIST,
      payload: { tab: 1, search: "", per_page: 10, influencerList: [] },
    });
    dispatch(getInfluencer("", 1, ""));
    dispatch(getInfluencerStats());
  }, []);

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    source: "",
    code: "",
    promo: "",
  });
  const [page, setPage] = useState(2);
  const [status, setStatus] = useState("");

  const clearState = () => {
    setFormData({ email: "", name: "", source: "", code: "", promo: "" });
    dispatch({
      type: Utils.ActionName.GET_INFLUENCER_EXIST,
      payload: {
        existCodeMsg: "",
        existCode: "",
      },
    });
    dispatch({
      type: Utils.ActionName.GET_EXIST_MAIL,
      payload: {
        existEmailScuse: "",
        existEmail: "",
      },
    });
  };
  const handleModal = () => {
    if (show) clearState();
    setShow(!show);
  };
  const createInflu = () => {
    dispatch(influencerCreate(formData));
    handleModal();
  };
  const emailChangeHandler = _.debounce((e) => {
    setFormData({ ...formData, email: e.target.value });
    dispatch(getInfluencerEmailExists(e.target.value));
  }, 1500);

  const observer = useRef();
  const lastPostElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && pagination.total_pages >= page) {
        dispatch(getInfluencer(status, page, ""));
        setPage(page + 1);
      } else {
        setEndUser("End of page");
      }
    });
    if (node) observer.current.observe(node);
  });
  return (
    <div className="dashboardUi">
      <SideBar />
      <div className="inner-page userListUI">
        <PageHeader title="Promo codes" />
        <Tab.Container defaultActiveKey="link-1">
          <Nav variant="tabs">
            <NavItemSet
              eventKey="link-1"
              status=""
              badge={influencerStats?.total}
              setStatus={setStatus}
              title="Total"
              setPage={setPage}
              payload={{ tab: 1, search: "", per_page: 10, influencerList: [] }}
              getFunc={getInfluencer}
            />
            <NavItemSet
              eventKey="link-2"
              status={2}
              badge={influencerStats?.active}
              setStatus={setStatus}
              title="Active"
              setPage={setPage}
              payload={{ tab: 1, search: "", per_page: 10, influencerList: [] }}
              getFunc={getInfluencer}
              active={true}
            />
            <NavItemSet
              eventKey="link-3"
              status={1}
              badge={influencerStats?.inactive}
              setStatus={setStatus}
              title="Inactive"
              setPage={setPage}
              payload={{ tab: 3, search: "", per_page: 10, influencerList: [] }}
              getFunc={getInfluencer}
              active={false}
            />
            <Button
              variant="primary"
              onClick={handleModal}
              className="ml-auto createNewBtn"
            >
              Create new
            </Button>
          </Nav>
          <Tab.Content className="influencersContent">
            <Tab.Pane eventKey="link-1">
              {!status ? (
                <InfluencersList
                  lastPostElementRef={lastPostElementRef}
                  status={status}
                />
              ) : null}
              <p className="text-danger">{endUser}</p>
            </Tab.Pane>
            <Tab.Pane eventKey="link-2">
              {status === 2 ? (
                <InfluencersList
                  lastPostElementRef={lastPostElementRef}
                  status={status}
                />
              ) : null}
            </Tab.Pane>
            <Tab.Pane eventKey="link-3">
              {status === 1 ? (
                <InfluencersList
                  lastPostElementRef={lastPostElementRef}
                  status={status}
                />
              ) : null}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        <Modal
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={show}
          onHide={handleModal}
          className="requestModal influencerModal"
        >
          <Modal.Header closeButton>
            <Modal.Title> New Influencer </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* <Form> */}
            <Form.Group className="mb-3" controlId="formGridAddress1">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                // value={email}
                onChange={emailChangeHandler}
                placeholder="Enter Email"
              />
              {existEmailScuse.length ? (
                <p className="text-success">{existEmailScuse}</p>
              ) : (
                <p className="text-danger">{existEmail}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridAddress1">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                // value={name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter Name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridAddress2">
              <Form.Label>Source</Form.Label>
              <select
                class="form-control"
                // value={source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
              >
                <option>Enter Source</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">Tik tok</option>
              </select>
              {/* <Form.Control type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Enter Source" /> */}
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridEmail">
                <Form.Label>Code</Form.Label>
                <Form.Control
                  type="text"
                  // value={code}
                  onChange={(e) => {
                    setFormData({ ...formData, code: e.target.value });
                    dispatch(getInfluencerExistCode(e.target.value));
                  }}
                  placeholder="Enter Code"
                />
                {existCodeMsg.length ? (
                  <p className="text-success">{existCodeMsg}</p>
                ) : (
                  <p className="text-danger">{existCode}</p>
                )}
              </Form.Group>
              <Form.Group as={Col} controlId="formGridPassword">
                <Form.Label>Promo %</Form.Label>
                <Form.Control
                  type="text"
                  // value={promo}
                  onChange={(e) =>
                    setFormData({ ...formData, promo: e.target.value })
                  }
                  placeholder="Enter Promo %"
                />
              </Form.Group>
            </Row>

            <Button
              variant="primary"
              type="submit"
              className="InfluencerSubmitBtn"
              onClick={createInflu}
            >
              Submit
            </Button>
            {/* </Form> */}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default InfluencerPage;
