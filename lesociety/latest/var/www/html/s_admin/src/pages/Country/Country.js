import React, { useEffect, useState } from "react";
import _ from "lodash";
import {
  Nav,
  Tab,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import SideBar from "../sideBar/sidebar.js";
import {
  getCountryList,
  createCountry,
  updateCountryName
} from "../pageContainer/action";
import PageHeader from "../pageContainer/header";
import CountryList from "./CountryList";
import Utils from "../../utility/index.js";
import { NavItemSet } from "../pageContainer/Component";
import {AllCountryList} from "./AllCountry";

function CountryPage() {
  const dispatch = useDispatch();
  const [endUser, setEndUser] = useState('');

  useEffect(() => {
    dispatch({
      type: Utils.ActionName.USER_LIST,
      payload: { tab: 1, search: "", per_page: 10, countryList: [] },
    });
    dispatch(getCountryList("", 1, ""));
  }, []);

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: "", id: ""
  });
  const [type, setType] = useState("");

  const clearState = () => {
    setFormData({ name: "", id: "" });
  };
  const handleModal = () => {
    if (show) clearState();
    setShow(!show);
  };
  const createInflu = (e) => {
    e.preventDefault();
    if (type === "edit") {
      dispatch(updateCountryName(formData));
    } else {
      dispatch(createCountry(formData));

    }
    handleModal();
  };
  return (
    <div className="dashboardUi">
      <SideBar />
      <div className="inner-page userListUI">
        <PageHeader title="Country" />
        <Tab.Container defaultActiveKey="link-1">
          <Nav variant="tabs">
            <NavItemSet
              eventKey="link-1"
              status=""
              // setStatus={}
              title="Total Country"
              payload={{ tab: 1, search: "", per_page: 10, countryList: [] }}
              getFunc={getCountryList}
            />
            <Button
              variant="primary"
              onClick={() => {
                handleModal();
                setType("");
              }}
              className="ml-auto createNewBtn"
            >
              Create new
            </Button>
          </Nav>
          <Tab.Content className="influencersContent">
            <Tab.Pane eventKey="link-1">
              <CountryList
                handleModal={handleModal}
                setFormData={setFormData}
                setType={setType}
              />
              <p className="text-danger">{endUser}</p>
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
            <Modal.Title> New Country </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={createInflu}>

              <Form.Group className="mb-3" controlId="formGridAddress1">
                <Form.Label>Name</Form.Label>
                <Form.Select aria-label="Country list dropdown" 
                  className="form-control"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                    
                  }>
                  <option>Click here to select country</option>
                  {Array.isArray(AllCountryList) ? 
                  AllCountryList.map(country => {
                    return <option value={country}>{country}</option>
                  })
                  : null}
                </Form.Select>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="InfluencerSubmitBtn"
              >
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default CountryPage;
