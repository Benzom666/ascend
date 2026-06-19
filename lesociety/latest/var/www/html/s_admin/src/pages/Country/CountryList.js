import React from "react";
import { DropdownButton, Dropdown, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

import { deleteCountry } from "../pageContainer/action";

const CountryList = ({setFormData, handleModal, setType}) => {
    const dispatch = useDispatch();

    const { countryList } = useSelector(
        (state) => state.userListReducer
    );

    return (
        <Table striped bordered hover variant="dark">
            <thead>
                <tr>
                    <th>Country Name</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(countryList) && countryList[0]
                    ? countryList.map((country) => {
                        return (
                            <tr
                                key={country._id}
                            >
                                <td>{country?.name}</td>
                                <td>
                                    <DropdownButton
                                        variant="outline-secondary"
                                        title={
                                            <img
                                                src="https://i.ibb.co/jwq9z0R/moreIcon.png"
                                                alt="moreIcon"
                                                border="0"
                                            />
                                        }
                                        id="input-group-dropdown-2"
                                        align="end"
                                    >
                                        {/* <Dropdown.Item
                                            eventKey="1"
                                            onClick={() => {
                                                dispatch(
                                                    influencerUpdateStatus(2, country?.email, true, status)
                                                );
                                            }}
                                        >
                                            Active
                                        </Dropdown.Item> */}
                                        
                                        <Dropdown.Item
                                            eventKey="req"
                                            onClick={() => {
                                                handleModal();
                                                setFormData({name: country?.name, id: country?._id});
                                                setType("edit")
                                            }}
                                        >
                                            Edit
                                        </Dropdown.Item> 
                                       
                                        <Dropdown.Item
                                            eventKey="req"
                                            onClick={() => {
                                                dispatch(deleteCountry(country?.name));
                                            }}
                                        >
                                            Delete
                                        </Dropdown.Item>
                                    </DropdownButton>
                                </td>
                            </tr>
                        );
                    })
                    : null}
            </tbody>
        </Table>
    );
};

export default CountryList;
