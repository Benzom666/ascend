import React from "react";
import styled from "styled-components";

const EditDateReviewModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        <Title>Update received.</Title>
        <Text>
          Your updated description is in review and will be updated when
          approved.
        </Text>
        <Button onClick={onClose}>OK, GOT IT!</Button>
      </Card>
    </Overlay>
  );
};

export default EditDateReviewModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Card = styled.div`
  background: #161616;
  border-radius: 20px;
  padding: 34px 26px 24px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
`;

const Title = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 14px;
  line-height: 1.2;
`;

const Text = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #d0d0d0;
  line-height: 1.55;
  margin: 0 0 24px;
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #f24462 0%, #f02d4e 100%);
  border: none;
  border-radius: 12px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
`;
