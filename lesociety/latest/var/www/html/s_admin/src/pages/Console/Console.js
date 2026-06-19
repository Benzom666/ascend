import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Row, Col, Form, Table, Badge, ListGroup, Modal, Spinner } from "react-bootstrap";

import SideBar from "../sideBar/sidebar.js";
import PageHeader from "../pageContainer/header";
import Utils from "../../utility/index.js";
import "./Console.css";

const REQUEST_STATUS = { 0: "Pending", 1: "Accepted", 2: "Rejected", 3: "Ignored" };
const payloadOf = (res) => res?.data?.data || {};

function Console() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const [selected, setSelected] = useState(null); // { profile, counts }
  const [requests, setRequests] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [activeRoom, setActiveRoom] = useState(null); // { room, data }
  const [showMessages, setShowMessages] = useState(false);
  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);

  const loadProfiles = () => {
    setLoadingProfiles(true);
    const params = `?limit=50&search=${encodeURIComponent(search)}&gender=${encodeURIComponent(gender)}`;
    Utils.api.getApiCall(
      Utils.endPoints.consoleProfiles,
      params,
      (res) => {
        setProfiles(payloadOf(res).data || []);
        setLoadingProfiles(false);
      },
      (err) => {
        Utils.showAlert(3, err?.data?.message || "Failed to load profiles.");
        setLoadingProfiles(false);
      }
    );
  };

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectProfile = (id) => {
    setLoadingDetail(true);
    setSelected(null);
    setRequests([]);
    setChatRooms([]);
    const base = Utils.endPoints.consoleProfile + id;
    Utils.api.getApiCall(base, "", (res) => setSelected(payloadOf(res)), () => {});
    Utils.api.getApiCall(`${base}/requests`, "?limit=50", (res) => setRequests(payloadOf(res).data || []), () => {});
    Utils.api.getApiCall(
      `${base}/chatrooms`,
      "?limit=50",
      (res) => {
        setChatRooms(payloadOf(res).data || []);
        setLoadingDetail(false);
      },
      () => setLoadingDetail(false)
    );
  };

  const openRoom = (roomId) => {
    setActiveRoom(null);
    setComposer("");
    setShowMessages(true);
    Utils.api.getApiCall(
      Utils.endPoints.consoleRoomMessages + roomId + "/messages",
      "?limit=200",
      (res) => setActiveRoom(payloadOf(res)),
      (err) => Utils.showAlert(3, err?.data?.message || "Failed to load messages.")
    );
  };

  const sendAsProfile = (e) => {
    e.preventDefault();
    const message = composer.trim();
    const senderId = selected?.profile?._id;
    const roomId = activeRoom?.room?._id;
    if (!message || !senderId || !roomId) return;

    setSending(true);
    Utils.api.postApiCall(
      Utils.endPoints.consoleRoomMessages + roomId + "/messages",
      { senderId, message },
      (res) => {
        const created = payloadOf(res);
        setActiveRoom((prev) => ({
          ...prev,
          data: [...(prev?.data || []), { ...created, sender_id: { user_name: selected.profile.user_name } }],
        }));
        setComposer("");
        setSending(false);
      },
      (err) => {
        Utils.showAlert(3, err?.data?.message || "Failed to send message.");
        setSending(false);
      }
    );
  };

  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/" replace={true} />;

  return (
    <div className="dashboardUi">
      <SideBar />
      <div className="inner-page consoleUI">
        <PageHeader title="Profiles Console" />
        <p className="console-note">Oversight console. Messages sent here are delivered on behalf of the selected profile and are recorded against your admin account.</p>

        <Row>
          {/* Profiles list */}
          <Col md="4" className="console-list">
            <Form
              className="console-filters"
              onSubmit={(e) => {
                e.preventDefault();
                loadProfiles();
              }}
            >
              <Form.Control
                size="sm"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Form.Select size="sm" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">All genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Form.Select>
              <button type="submit" className="console-btn">Search</button>
            </Form>

            {loadingProfiles ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <ListGroup className="console-profile-list">
                {profiles.map((p) => (
                  <ListGroup.Item
                    key={p._id}
                    action
                    active={selected?.profile?._id === p._id}
                    onClick={() => selectProfile(p._id)}
                  >
                    <strong>{p.user_name || "(no name)"}</strong>
                    <span className="console-sub">{p.email} · {p.gender || "?"}</span>
                  </ListGroup.Item>
                ))}
                {!profiles.length && <ListGroup.Item>No profiles found.</ListGroup.Item>}
              </ListGroup>
            )}
          </Col>

          {/* Selected profile detail */}
          <Col md="8" className="console-detail">
            {loadingDetail && <Spinner animation="border" size="sm" />}
            {selected && (
              <>
                <div className="console-overview">
                  <h5>{selected.profile?.user_name}</h5>
                  <span className="console-sub">{selected.profile?.email}</span>
                  <div className="console-counts">
                    <Badge bg="warning">Pending {selected.counts?.requests?.pending || 0}</Badge>
                    <Badge bg="success">Accepted {selected.counts?.requests?.accepted || 0}</Badge>
                    <Badge bg="secondary">Rejected {selected.counts?.requests?.rejected || 0}</Badge>
                    <Badge bg="dark">Ignored {selected.counts?.requests?.ignored || 0}</Badge>
                    <Badge bg="info">Chat rooms {selected.counts?.chatRooms || 0}</Badge>
                  </div>
                </div>

                <h6 className="console-section-title">Incoming interest requests</h6>
                <Table striped bordered size="sm" responsive>
                  <thead>
                    <tr><th>From</th><th>Type</th><th>Status</th><th>Message</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td>{r.requester?.user_name || r.requester_id}</td>
                        <td>{r.request_type}</td>
                        <td>{REQUEST_STATUS[r.status] ?? r.status}</td>
                        <td>{r.message || "-"}</td>
                        <td>{r.created_date ? new Date(r.created_date).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                    {!requests.length && <tr><td colSpan="5">No requests.</td></tr>}
                  </tbody>
                </Table>

                <h6 className="console-section-title">Chat rooms</h6>
                <Table striped bordered size="sm" responsive>
                  <thead>
                    <tr><th>With</th><th>Messages</th><th>Last message</th><th></th></tr>
                  </thead>
                  <tbody>
                    {chatRooms.map((room) => (
                      <tr key={room._id}>
                        <td>{room.otherUser?.user_name || "-"}</td>
                        <td>{room.messageCount || 0}</td>
                        <td className="console-truncate">{room.lastMessage?.message || "-"}</td>
                        <td>
                          <button className="console-btn" onClick={() => openRoom(room._id)}>View</button>
                        </td>
                      </tr>
                    ))}
                    {!chatRooms.length && <tr><td colSpan="4">No chat rooms.</td></tr>}
                  </tbody>
                </Table>
              </>
            )}
            {!selected && !loadingDetail && <p className="console-sub">Select a profile to view its activity.</p>}
          </Col>
        </Row>

        {/* Message history modal */}
        <Modal show={showMessages} onHide={() => setShowMessages(false)} size="lg" scrollable>
          <Modal.Header closeButton>
            <Modal.Title>Conversation history</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!activeRoom ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <div className="console-messages">
                {(activeRoom.data || []).map((m) => (
                  <div key={m._id} className="console-message">
                    <span className="console-msg-sender">{m.sender_id?.user_name || "Unknown"}</span>
                    <span className="console-msg-text">{m.message}</span>
                    <span className="console-msg-time">{m.created_date ? new Date(m.created_date).toLocaleString() : ""}</span>
                  </div>
                ))}
                {!(activeRoom.data || []).length && <p>No messages in this room.</p>}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="console-composer">
            <Form className="console-composer-form" onSubmit={sendAsProfile}>
              <span className="console-composer-as">
                Sending as <strong>{selected?.profile?.user_name || "this profile"}</strong>
              </span>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Type a message to send on behalf of this profile…"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                disabled={!activeRoom || sending}
              />
              <button type="submit" className="console-btn" disabled={!composer.trim() || !activeRoom || sending}>
                {sending ? "Sending…" : "Send"}
              </button>
            </Form>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Console;
