import { FiCheck } from "react-icons/fi";
import React from "react";
import Select from "react-select";
import { IoMdLocate } from "react-icons/io";
import { drowdownStyles } from "./styles";

export function uploadFileField({
  accept,
  input,
  value,
  type,
  meta: { touched, error, warning },
  disabled,
}) {
  return (
    <div className={`secret-input type-${type}`}>
      <React.Fragment>
        {touched &&
          ((error && <span className="error">{error}</span>) ||
            (warning && <span>{warning}</span>))}
        <input
          {...input}
          onBlur={() => console.log("hello")}
          value={value}
          autoComplete="off"
          className="form-control"
          type={type}
          accept={accept}
          disabled={disabled}
        />
      </React.Fragment>
    </div>
  );
}

export const renderDropdown = ({
  loading,
  iconClick,
  withIcon,
  subLabel,
  input,
  options,
  id,
  valueField,
  name,
  type,
  placeholder,
  label,
  meta: { touched, error, warning },
  ...props
}) => {
  let borderColor = "";
  if (touched && error) {
    borderColor = "#F24462";
  } else if (!error) {
    borderColor = "";
  }

  console.log("input", input);
  return (
    <React.Fragment>
      <div className={`secret-input type-${type}`}>
        {label && <label>{label}</label>}
        {subLabel && <p className="subLabel">{subLabel}</p>}
        {touched &&
          ((error && <span className="error">{error}</span>) ||
            (warning && <span>{warning}</span>))}
        <div className="dropdwon-wrapper text-capitalize">
          <Select
            {...input}
            id={id}
            value={input.value}
            onChange={(value) => input.onChange(value)}
            options={options}
            placeholder={placeholder}
            styles={drowdownStyles}
            // className={touched && error && 'error-dropdown'}
            name={name}
            touched={touched}
            error={error}
            {...props}
            onBlur={(value) => input.onBlur()}
            selectedValue={input.value}
            // components={{ DropdownIndicator }}
            autoFocus={false}
            withIcon={withIcon}
            // menuIsOpen={false}
            // openMenuOnClick={false}
          />
          {loading && <span className="spin-loader"></span>}
          {!loading && withIcon && (
            <span className={`location-diduct-icon`} onClick={iconClick}>
              <IoMdLocate />
            </span>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export function inputField({
  refName,
  ignoreTouch,
  input,
  label,
  icon,
  placeholder,
  type,
  meta,
  meta: { touched, error, warning },
  isValid,
  loading,
  validationLength,
  disabled,
}) {
  let borderColor = "";
  if (meta.active || input.input === "") {
    borderColor = "";
  } else if (touched && error) {
    borderColor = "#F24462";
  } else if (!error) {
    borderColor = "";
  }

  return (
    <div className={`secret-input type-${type}`}>
      <React.Fragment>
        {label &&
          (type == "text" || type == "password" || type == "number") && (
            <label>{label}</label>
          )}
        {(ignoreTouch ||
          touched ||
          Number(validationLength) - Number(input?.value?.length) < 0) &&
          ((error && <span className="error">{error}</span>) ||
            (warning && <span>{warning}</span>))}
        <span className="pos-relative ">
          <input
            ref={refName}
            {...input}
            autoComplete="new-password"
            className="form-control"
            style={{ borderColor }}
            placeholder={placeholder}
            type={type}
            disabled={disabled}
          />
          {loading && <span className="spin-loader"></span>}
          {isValid && (
            <span className="has-check">
              <FiCheck />
            </span>
          )}
        </span>
        <span className="position-absolute end-0 f-11">
          {label == "Your tagline"
            ? Number(validationLength) - Number(input?.value?.length)
            : ""}
        </span>
        {label && type != "text" && type != "password" && type != "number" && (
          <label>{label}</label>
        )}
      </React.Fragment>
    </div>
  );
}
export function inputFieldWithIcon({
  loading,
  subLabel,
  iconClick,
  input,
  label,
  icon,
  placeholder,
  type,
  meta: { touched, error, warning },
}) {
  return (
    <div className={`secret-input type-${type}`}>
      <React.Fragment>
        {label &&
          (type == "text" || type == "password" || type == "number") && (
            <label>{label}</label>
          )}
        {subLabel && <p className="subLabel">{subLabel}</p>}
        {touched &&
          ((error && <span className="error">{error}</span>) ||
            (warning && <span>{warning}</span>))}
        <span className="pos-relative ">
          <input
            {...input}
            autoComplete="off"
            className="form-control"
            placeholder={placeholder}
            type={type}
          />
          {!loading && (
            <span className="location-diduct-icon" onClick={iconClick}>
              {icon}
            </span>
          )}
          {loading && <span className="spin-loader"></span>}
        </span>
        {label && type != "text" && type != "password" && type != "number" && (
          <label>{label}</label>
        )}
      </React.Fragment>
    </div>
  );
}

export function textarea({
  input,
  label,
  placeholder,
  type,
  validationLength,
  meta: { touched, error, warning },
  disabled,
}) {
  return (
    <div className={`secret-input type-${type}`}>
      <React.Fragment>
        <label>{label}</label>
        {(touched ||
          Number(validationLength) - Number(input?.value?.length) < 0) &&
          ((error && <span className="error">{error}</span>) ||
            (warning && <span>{warning}</span>))}
        <textarea
          {...input}
          autoComplete="off"
          className={`form-control`}
          style={
            (touched && error) ||
            Number(validationLength) - Number(input?.value?.length) < 0
              ? { border: "3px solid #F24462" }
              : {}
          }
          placeholder={placeholder}
          disabled={disabled}
        />
        <span className="position-absolute end-0 f-11">
          {label == "What do you offer?" || "Describe_Date_Details"
            ? Number(validationLength) - Number(input?.value?.length)
            : ""}
        </span>
      </React.Fragment>
    </div>
  );
}

export function buttonField({ label, disabled, type, loading }) {
  return (
    <div className={`secret-input type-${type}`}>
      <button disabled={disabled} type={type}>
        {loading ? <span className="spin-loader-button"></span> : label}
      </button>
    </div>
  );
}

export function selectField({
  input: { onChange, defaultOption, value, ...inputProps },
  options,
  label,
  meta: { touched, error, warning },
}) {
  return (
    <div className={`secret-input type-select`}>
      <label>{label}</label>
      <select {...inputProps} onChange={(value) => onChange(value)}>
        {defaultOption && <option value=""> {defaultOption} </option>}
        {options?.map((data, index) => (
          <option key={data.id} value={data.id} selected={value == data.id}>
            {index === 0 ? data.name : data.name}
          </option>
        ))}
      </select>
      {touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))}
    </div>
  );
}

export function radioField({
  input,
  hideText,
  onlyLabel,
  options,
  label,
  disabled,
  meta: { touched, error, warning },
}) {
  return (
    <div className={`secret-input type-checkbox`}>
      <label>{label}</label>
      <div className="multi-radio">
        {options?.map((option, index) => {
          return (
            <React.Fragment>
              {touched &&
                ((error && <span className="error">{error}</span>) ||
                  (warning && <span>{warning}</span>))}
              <div className="label-box">
                <input
                  {...input}
                  id={`${input.name}_${option.id}`}
                  type="radio"
                  value={
                    onlyLabel
                      ? option.price
                      : option.price
                      ? option.price + option.suptag
                      : option.id
                  }
                  checked={
                    onlyLabel
                      ? option.price == input.value
                      : option.price
                      ? option.price + option.suptag == input.value
                      : option.id == input.value
                  }
                  disabled={disabled}
                />
                <label
                  className="value-label"
                  htmlFor={`${input.name}_${option.id}`}
                >
                  {!hideText && <span>{option.name}</span>}
                  <span className="price_wrap">
                    <span className="price">
                      <sup>{option.suptag}</sup>
                      {option.price}
                    </span>
                  </span>
                </label>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function checkboxField({
  label,
  input,
  options,
  meta: { touched, error, warning },
}) {
  return (
    <div className={`secret-input type-checkbox checkbox_wrap`}>
      <label>{label}</label>
      {options?.map((option, index) => {
        return (
          <React.Fragment>
            <label htmlFor={`${input.name}_${option.id}`}>
              <input
                type="checkbox"
                id={`${input.name}_${option.id}`}
                value={option.id}
                onChange={(event) => {
                  let { value, checked } = event.target,
                    values = input.value ? input.value : [];
                  checked
                    ? values.push(value)
                    : values.splice(values.indexOf(option.id), 1);
                  input.onChange(values);
                }}
              />
              <span className="check-lable">{option.name}</span>
            </label>
          </React.Fragment>
        );
      })}
      {touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))}
    </div>
  );
}
