import React from 'react';
import {Stack,Dropdown, Image } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import Profile from '../../assets/images/profleIamge.svg'

const PageHeader = props => {
  let navigate = useNavigate();
  const logoutHandler = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("adminRole");
    navigate("/");
  }
  return (
    <Stack direction="horizontal" className="pageHeaderBox" gap={3}>
      <div className="pageTitle"> {props.title} </div>
      <div className="ms-auto profileDropDown"> 
        <Dropdown align="end">
        <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary">
            Username
        </Dropdown.Toggle>

        <Dropdown.Menu variant="dark">
            <Dropdown.Item active role="button" onClick={logoutHandler}>
            Logout
            </Dropdown.Item>
            {/* <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="#/action-4">Separated link</Dropdown.Item> */}
        </Dropdown.Menu>
        </Dropdown>
        <Image src={Profile}/>
      </div>
    </Stack>
  )
}
export default PageHeader;
