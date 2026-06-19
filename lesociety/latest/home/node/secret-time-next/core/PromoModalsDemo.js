import React, { useState } from "react";
import styled from "styled-components";
import PromoModals from "./PromoModals";

const PromoModalsDemo = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <DemoContainer>
      <DemoHeader>Popup Modals Demo - Click to Test</DemoHeader>

      <ButtonContainer>
        <TestButton onClick={() => openModal("promo_50_off")}>
          50% Off Popup
        </TestButton>
        <TestButton onClick={() => openModal("not_live")}>
          Not Live Yet Popup
        </TestButton>
        <TestButton onClick={() => openModal("success")}>
          Success You're Live
        </TestButton>
        <TestButton onClick={() => openModal("first_3_free")}>
          First 3 Free Popup
        </TestButton>
      </ButtonContainer>

      <PromoModals
        isOpen={activeModal !== null}
        onClose={closeModal}
        type={activeModal || "success"}
      />

      <InfoText>
        <h3>Usage:</h3>
        <code>const [activeModal, setActiveModal] = useState(null);</code><br />
        <code>&lt;PromoModals isOpen={activeModal !== null} onClose={() => setActiveModal(null)} type={activeModal} /&gt;</code><br /><br />
        <strong>Possible types:</strong>
        <ul style={{ marginTop: "10px" }}>
          <li>"promo_50_off" - 50% Off promotional popup</li>
          <li>"not_live" - User not live yet popup</li>
          <li>"success" - Success confirmation popup</li>
          <li>"first_3_free" - First 3 interests free popup</li>
        </ul>
      </InfoText>
    </DemoContainer>
  );
};

const DemoContainer = styled.div`
  min-height: 100vh;
  background: #121212;
  padding: 40px 20px;
  font-family: 'Helvetica', 'Arial', sans-serif;
`;

const DemoHeader = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 40px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
`;

const TestButton = styled.button`
  background: #f24462;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e03e58;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(242, 68, 98, 0.4);
  }
`;

const InfoText = styled.div`
  background: #1a1a1a;
  padding: 24px;
  border-radius: 12px;
  max-width: 600px;

  h3 {
    color: #f24462;
    margin-top: 0;
  }

  code {
    background: #2a2a2a;
    padding: 8px 12px;
    border-radius: 6px;
    color: #e91e63;
    font-size: 14px;
    display: block;
    margin: 8px 0;
  }

  ul {
    color: #d1d5db;
    line-height: 1.8;
  }
`;

export default PromoModalsDemo;
