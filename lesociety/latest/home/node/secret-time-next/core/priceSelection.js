import React, { useState, useEffect } from "react";
import styled from "styled-components";

const PriceSelection = (props) => {
  const [options, setOptions] = useState(props.options);
  const onChange = (value) => {
    const {
      input: { onChange },
    } = props;
    onChange(value);
  };
  useEffect(() => {
    if (props.defaultChecked) props.input.onChange(props.defaultChecked);
  }, []);
  const {
    onlyLabel,
    input,
    meta: { warning, touched, error },
  } = props;

  return (
    <ClassSelectionStyle
      className="class_select_wrap"
      style={{ color: props.textColor }}
      checkColor={{ checked: props.checkedColor }}
    >
      {options &&
        options.map((option, index) => {
          return (
            <div className="radio_groups">
              <input
                type="radio"
                id={option.id}
                key={index}
                checked={
                  onlyLabel
                    ? option.price == input.value
                    : option.price + option?.suptag === input.value
                }
                onChange={() =>
                  onChange(
                    onlyLabel ? option.price : option.price + option?.suptag
                  )
                }
              />
              <div className="active_class">
                <label htmlFor={`${input.name}_${option.id}`}>
                  <span className="price_wrap">
                    <span className="price">
                      <sup>{option?.suptag}</sup>
                      {option.price}
                    </span>
                  </span>
                </label>
              </div>
              {touched &&
                ((error && <span className="error">{error}</span>) ||
                  (warning && <span>{warning}</span>))}
            </div>
          );
        })}
    </ClassSelectionStyle>
  );
};
export default PriceSelection;

const ClassSelectionStyle = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: #afabab;
  margin: 15px -5px 0;
  .radio_groups {
    margin-right: 0px;
    padding: 5px;
    width: 50%;
    position: relative;
    .active_class {
      height: 125px;
      display: flex;
      align-items: center;
      flex-direction: column;
      min-height: 90px;
      border: 1px solid #293036;
      justify-content: center;
      padding: 15px;
      border-radius: 13px;
      text-align: center;
      span {
        display: inline-block;
        margin-bottom: 0px !important;
        font-size: 24px;
      }
      @media only screen and (max-width: 767px) {
        span {
          margin-bottom: 5px;
          svg {
            width: 20px;
            height: 20px;
          }
        }
      }
    }

    input {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      z-index: 1;
      opacity: 0;
      & ~ div.active_class label {
        font-size: 18px;
        font-weight: 500;
        line-height: 18px;
        padding-left: 0px;
        margin-top: 10px;
        position: relative;
        @media only screen and (max-width: 767px) {
          font-size: 10px;
          line-height: 15px;
          span {
          }
        }
      }
      &:checked {
        & ~ div.active_class label {
          color: ${(props) => props.checkColor.checked};
          &:before {
            border: 2px solid ${(props) => props.checkColor.checked};
          }
        }
        & ~ div.active_class {
          border-color: ${(props) => props.checkColor.checked};
          span {
            svg {
              color: ${(props) => props.checkColor.checked};
              fill: ${(props) => props.checkColor.checked};
              path,
              g,
              rect {
                fill: ${(props) => props.checkColor.checked};
              }
            }
          }
        }
      }
    }
  }
`;
