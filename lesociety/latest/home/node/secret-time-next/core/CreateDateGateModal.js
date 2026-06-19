import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Card = styled.div`
  background: #1a1a1a;
  border-radius: 20px;
  padding: 40px 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 20px 0;
  line-height: 1.3;
  text-align: center;
`;

const Text = styled.p`
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #cccccc;
  line-height: 1.6;
  margin: 0 0 16px 0;
  text-align: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 24px 0;
  cursor: pointer;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 14px;
  color: #aaaaaa;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #F24462 0%, #F02D4E 100%);
  border: none;
  border-radius: 12px;
  font-family: "Conv_Helvetica", "Helvetica", Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(242, 68, 98, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CreateDateGateModal = ({
  isOpen,
  variant = "intro",
  onClose,
  onProceed,
  checked = false,
  onToggleChecked,
}) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        {variant === "intro" ? (
          <>
            <Title>Want offers to flood in fast?</Title>
            <Text>
              Ladies who post a few tempting date options go on far more dates
              and give themselves way more chances to meet someone amazing.
            </Text>
            <Text>
              Create up to 4 dates and never get lost in the crowd. Each with
              its own mood, duration and price.
            </Text>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={checked}
                onChange={onToggleChecked}
              />
              <span>Don't show me this again</span>
            </CheckboxLabel>
            <Button onClick={onProceed}>
              OK, GOT IT!
            </Button>
          </>
        ) : (
          <>
            <Title>You've reached your limit.</Title>
            <Text>
              You can have up to 4 dates posted in the gallery at a time. If you
              like, you can delete an existing date and create a new one.
            </Text>
            <Text>
              We'll unlock more dates soon!
            </Text>
            <Button onClick={onClose}>
              OK, GOT IT!
            </Button>
          </>
        )}
      </Card>
    </Overlay>
  );
};

export default CreateDateGateModal;
