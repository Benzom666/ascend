import React, { useEffect } from "react";
import { DropdownButton, Dropdown, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

import Utils from "../../utility";
import {
  influencerUpdateStatus,
  getInfluencer,
  deleteInfluencer,
} from "../pageContainer/action";
import FaceBookIcon from "../../assets/images/facebook.svg";
import TicTocIcon from "../../assets/images/ticTok.svg";
import InstagramIcon from "../../assets/images/instagram.svg";
import EditInfluencers from "./EditInfluencers";
import { SearchDropdownSet } from "../pageContainer/Component";

const InfluencersTable = ({ lastPostElementRef, status }) => {
  const dispatch = useDispatch();

  const { influencerList, per_page } = useSelector(
    (state) => state.userListReducer
  );
  useEffect(() => {
    document.getElementById("search").focus();
  }, []);

  const handleOnSelectAll = (e) => {
    const allEmail = influencerList.map((item) => item.emailId);
    dispatch({
      type: Utils.ActionName.GET_INFLUENCER,
      payload: { rowSelected: allEmail },
    });
  };

  const searchHandler = _.debounce((e) => {
    const payload = { search: e.target.value };
    if (!e.target.value) payload.influencerList = [];
    dispatch({
      type: Utils.ActionName.GET_INFLUENCER,
      payload,
    });
    dispatch(getInfluencer(status));
  }, 1000);

  return (
    <>
      <SearchDropdownSet
        per_page={per_page}
        searchHandler={searchHandler}
        status={status}
        getFunc={getInfluencer}
        payload={{ influencerList: [] }}
      />
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => handleOnSelectAll(e)}
                id="all-check"
              />
            </th>
            <th>User Name</th>
            <th>Source</th>
            <th>Email</th>
            <th>Promo %</th>
            <th>Code</th>
            <th>Count</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(influencerList) && influencerList.length
            ? influencerList.map((influencer, index) => {
                return (
                  <tr
                    key={influencer.id}
                    ref={
                      influencerList.length === index + 1
                        ? lastPostElementRef
                        : null
                    }
                  >
                    <td>
                      <input
                        id="user-checkbox"
                        type="checkbox"
                        value={influencer.email}
                        name="user-checkbox"
                      />
                    </td>
                    <td>{influencer?.name}</td>
                    <td>
                      {
                        <div className="social-source-icon">
                          {(influencer?.source == "facebook" && (
                            <img src={FaceBookIcon} alt="facebook" />
                          )) ||
                            (influencer?.source == "instagram" && (
                              <img src={InstagramIcon} alt="instagram" />
                            )) ||
                            (influencer?.source == "tiktok" && (
                              <img src={TicTocIcon} alt="tiktok" />
                            ))}
                        </div>
                      }
                    </td>
                    <td>{influencer?.email}</td>
                    <td>{influencer?.promo + "%"}</td>
                    <td>{influencer?.code}</td>
                    <td>{influencer?.count}</td>
                    <td>{influencer?.status === 2 ? "Active" : "Inactive"}</td>
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
                        <Dropdown.Item
                          eventKey="1"
                          onClick={() => {
                            dispatch(
                              influencerUpdateStatus(2, influencer?.email, true, status)
                            );
                          }}
                        >
                          Active
                        </Dropdown.Item>
                        <Dropdown.Item
                          eventKey="req"
                          onClick={() => {
                            dispatch(
                              influencerUpdateStatus(
                                3,
                                influencer?.email,
                                false, status
                              )
                            );
                          }}
                        >
                          Inactive
                        </Dropdown.Item>
                        <EditInfluencers
                          name={influencer?.name}
                          email={influencer?.email}
                          promo={influencer?.promo}
                          code={influencer?.code}
                          source={influencer?.source}
                        />
                        <Dropdown.Item
                          eventKey="req"
                          onClick={() => {
                            dispatch(deleteInfluencer(influencer?.email, status));
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
    </>
  );
};

export default InfluencersTable;
