import React from "react";
import {
  Nav,
  Badge,
  Form,
  InputGroup,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";
import Utils from "../../utility/index.js";

import { useDispatch } from "react-redux";
export const SearchDropdownSet = ({
  status,
  per_page,
  searchHandler,
  getFunc,
  payload,
}) => {
  const dispatch = useDispatch();
  return (
    <InputGroup className="">
      <Form.Control
        placeholder="Search"
        type="text"
        id="search"
        name="search"
        // value={search}
        onChange={searchHandler}
      />
      <DropdownButton
        variant="outline-secondary"
        title={`${per_page} Per Page`}
        id="input-group-dropdown-2"
        align="end"
        onSelect={(e) => {
          dispatch({
            type: Utils.ActionName.USER_LIST,
            payload: {...payload, per_page: e},
          });
          dispatch(getFunc(status, 1));
        }}
      >
        <Dropdown.Item eventKey="10">10</Dropdown.Item>
        <Dropdown.Item eventKey="20">20</Dropdown.Item>
        <Dropdown.Item eventKey="25">25</Dropdown.Item>
        <Dropdown.Item eventKey="50">50</Dropdown.Item>
        <Dropdown.Item eventKey="100">100</Dropdown.Item>
      </DropdownButton>
    </InputGroup>
  );
};

export const NavItemSet = ({
  eventKey,
  status,
  title,
  badge,
  setStatus,
  setPage,
  payload,
  getFunc,
  active="",
  noAction=false
}) => {
  const dispatch = useDispatch();
  return (
    <Nav.Item>
      <Nav.Link tabIndex={-1}
        eventKey={eventKey}
        onClick={() => {
          dispatch({
            type: Utils.ActionName.USER_LIST,
            payload,
          });
          dispatch(getFunc(status, 1, active));
          setStatus(status);
          dispatch({
            type: "SET_PAGE",
            payload: {
              page: 1,
            },
          });
          // setPage(1);
        }}
      >
        {title}
        <Badge pill bg="secondary">
          {badge}
        </Badge>
      </Nav.Link>
    </Nav.Item>
  );
};
