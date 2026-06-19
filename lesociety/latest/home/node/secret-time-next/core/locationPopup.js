import React, { useEffect, useState } from "react";
import { Field, reduxForm, change } from "redux-form";
import { TransitionMotion, spring, presets } from "react-motion";
import { Inputs } from "core";
import H5 from "./H5";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { IoMdLocate } from "react-icons/io";
import _ from "lodash";
import { countriesCode } from "../utils/Utilities";
import {
  fetchLocation,
  fetchRealLocation,
  fetchLiveLocation,
} from "../modules/auth/forms/steps/validateRealTime";
import { useRef } from "react";
import { defaultSearchData } from "../assets/defaultSearch/defaultSearchData";

function LocationPopup({
  modalIsOpen,
  closeModal,
  selectedLocation,
  setLocation,
  setSearchStaus,
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [countries, setCountry] = useState("");
  const [places, setPlaces] = useState("");
  const [city, setCity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const user = useSelector((state) => state?.authReducer?.user);
  const [searching, setSearching] = useState(false);

  const locationRef = useRef(null);
  const [isFocused, setFocused] = useState(false);

  useEffect(() => {
    if (!modalIsOpen) {
      setFocused(false);
      setSearching(false);
    }
  }, [modalIsOpen]);

  useEffect(() => {
    if (modalIsOpen) {
      // stop scrolling page
      document.body.style.overflow = "hidden";
    } else {
      // allow scrolling page
      document.body.style.overflow = "unset";
    }
  }, [modalIsOpen]);

  const handleFetchLocation = async (cities) => {
    const alreadyInList = todo.find((item) =>
      item.data?.name?.toLowerCase()?.includes(cities?.toLowerCase())
    );
    if (!alreadyInList) {
      const res = await fetchRealLocation(cities, countries, setCity);
    }
  };

  useEffect(() => {
    if (selectedLocation?.city) {
      setPlaces(selectedLocation?.city);
      dispatch(change("LocationPopup", "enter_city", selectedLocation?.city));
      handleFetchLocation(selectedLocation?.city);
      return;
    }

    setPlaces("");
    dispatch(change("LocationPopup", "enter_city", ""));
  }, [dispatch, selectedLocation]);

  useEffect(() => {
    if (!modalIsOpen) {
      return;
    }

    if (!selectedLocation?.city) {
      setPlaces("");
      dispatch(change("LocationPopup", "enter_city", ""));
    }
  }, [dispatch, modalIsOpen, selectedLocation?.city]);

  const handleChange = async (e) => {
    setPlaces(e.target.value);
    handleFetchLocation(e.target.value);
  };

  useEffect(() => {
    if (city.length > 0) {
      const list = city.map((item) => ({
        key: "t" + item.name + item.country[0]?.id,
        data: {
          name: item.name,
          country: item?.country[0]?.text,
          short_code: item?.country[0]?.short_code,
          province: item?.province[0],
        },
      }));
      const data = [...todo, ...list];
      const finalTodo = data?.filter(
        (item, index) =>
          data?.findIndex(
            (ele) =>
              ele?.data?.name?.toLowerCase() === item?.data?.name?.toLowerCase()
          ) === index
      );
      setTodo(finalTodo);
    }
  }, [city]);

  const handleIcon = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (
          position.coords.latitude !== undefined &&
          position.coords.longitude !== undefined
        ) {
          const locations = await fetchLiveLocation(
            position.coords.latitude,
            position.coords.longitude,
            countries
          );
          const location = locations[0];
          setPlaces(location?.name);
          const alreadyInList = todo.find((item) =>
            item.data.name
              ?.toLowerCase()
              ?.includes(location?.name?.toLowerCase())
          );
          if (!alreadyInList) {
            setTodo([
              ...todo,
              {
                key: "t" + location?.name + location?.country[0]?.id,
                data: {
                  name: location?.name,
                  country: location?.country[0]?.text,
                  short_code: location?.country[0]?.short_code,
                  province: location?.province[0],
                },
              },
            ]);
          }
          dispatch(change("LocationPopup", "enter_city", location?.name));
          setLoading(false);
        }
      },
      (err) => setLoading(false),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    const fetch = async () => {
      const location = await fetchLocation();
      if (location) {
        const locationArray = Array.isArray(location) ? location : [location];
        const locationOption = locationArray
          .map((item) => countriesCode[item.name])
          .filter((item) => item !== undefined)
          .join();
        setCountry(locationOption);
      }
    };
    if (user?.gender === "male") {
      setCountry(user?.country_code);
    } else {
      fetch();
    }
  }, []);

  const getDefaultStyles = () => {
    return todo.map((todo) => ({
      ...todo,
      style: { height: 0, opacity: 1 },
    }));
  };

  const getStyles = () => {
    return todo
      .filter(({ data }) => {
        return data?.name?.toLowerCase()?.indexOf(places?.toLowerCase()) >= 0;
      })
      .map((todo, i) => {
        return {
          ...todo,
          style: {
            height: spring(70, presets.gentle),
            opacity: spring(1, presets.gentle),
          },
        };
      });
  };

  const willEnter = () => {
    return {
      height: 0,
      opacity: 1,
    };
  };

  const willLeave = () => {
    return {
      height: spring(0),
      opacity: spring(0),
    };
  };

  function updateSearch(newData) {
    // const existingData = recentSearches.find(
    //   (data) => data.key === newData.key
    // );
    // if (existingData) {
    //   setRecentSearches([...recentSearches.slice(0, 2)]);
    // } else {
    //   setRecentSearches([newData, ...recentSearches.slice(0, 2)]);
    // }
    // store only latest three and if same key found then remove previous one
    const existingData = recentSearches.filter(
      (data) => data.key !== newData.key
    );
    setRecentSearches([newData, ...existingData.slice(0, 2)]);
    // setRecentSearches([newData, ...recentSearches.slice(0, 2)]);
  }

  // console field value of enter_city

  // console.log("recentSearches", {
  //   isFocused,
  //   searching,
  //   places,
  // });

  const mainDefaultSearch = [
    {
      key: "t" + user?.location + user?._id,
      data: {
        name: user?.location,
        country: user?.country,
        short_code: user?.country_code,
        province: {
          name: user?.province,
          short_code: `${user?.country_code?.toUpperCase()}-${user?.province?.toUpperCase()}`,
          text: user?.province === "on" ? "Ontario" : user?.province,
        },
      },
    },
    ...defaultSearchData,
    // .filter(
    //   (n) => n.data?.name?.toLowerCase() !== user?.location?.toLowerCase()
    // )
  ];

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      bodyOpenClassName="open-modal-body"
      portalClassName="overlay-modal"
      style={{
        overlay: {
          // background: 'transparent',
          height: "calc(100vh - 46px)",
          top: "46px",
        },
      }}
      className="city-modal"
    >
      <div className="model_content city-wrapper">
        <div className="icon_wrap location">
          <H5>Select or Search Your City</H5>
          <span style={{ cursor: "pointer" }} onClick={closeModal}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.99 12.9925L1 1"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12.9862 1.00525L1.00623 12.9852"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </div>
        <div className="city-popup">
          <Field
            name="enter_city"
            type="text"
            onChange={handleChange}
            component={Inputs.inputFieldWithIcon}
            bigIcon={true}
            value={places}
            placeholder="Enter City"
            icon={<IoMdLocate />}
            iconClick={handleIcon}
            className="radio-list"
            loading={loading}
            // ref={locationRef}
            onFocus={() => {
              setFocused(true);
              setSearching(true);
            }}
            onBlur={() => {
              setFocused(false);
            }}
          />
        </div>
        <div className="radio-list">
          <TransitionMotion
            defaultStyles={getDefaultStyles()}
            styles={getStyles()}
            willLeave={willLeave}
            willEnter={willEnter}
          >
            {(styles) => (
              <ul>
                {/* Main Gallery option - always at top */}
                <li
                  style={{ opacity: 1 }}
                  onClick={() => {
                    setLocation({});
                    setSearchStaus(false);
                    setPlaces("");
                    dispatch(change("LocationPopup", "enter_city", ""));
                    setTimeout(() => {
                      closeModal();
                    }, 1000);
                  }}
                >
                  <span>Main Gallery</span>
                  <input
                    type="radio"
                    checked={!selectedLocation?.city}
                  />
                  <div className="check"></div>
                </li>
                {((!isFocused && !searching) || !places) &&
                user?.country_code === "ca" &&
                user?.country === "Canada"
                  ? mainDefaultSearch
                      .filter(({ data }) => user?.location !== data?.name)
                      .map(({ key, style, data }) => (
                      <li
                        key={key}
                        style={style}
                        onClick={() => {
                          setLocation({
                            city: data?.name,
                            country: data?.short_code,
                            province: data?.province?.short_code?.split("-")[1],
                          });
                          setSearchStaus(true);

                          setTimeout(() => {
                            closeModal();
                          }, 1000);
                        }}
                      >
                        <span>{data?.name}</span>
                        <br />
                        <span style={{ fontSize: "16px", marginLeft: "5px" }}>
                          {user?.location !== data?.name
                            ? `${data?.province?.text}, ${data?.country}`
                            : ""}
                        </span>
                        <input
                          type="radio"
                          checked={
                            selectedLocation?.city ===
                            // ?.toLowerCase()
                            data?.name
                            // ?.toLowerCase()
                          }
                        />
                        <div className="check"></div>
                      </li>
                    ))
                  : styles.map(({ key, style, data }) => (
                      <li
                        key={key}
                        style={style}
                        onClick={() => {
                          setLocation({
                            city: data?.name,
                            country: data?.short_code,
                            countryName: data?.country,
                            province: data?.province?.short_code?.split("-")[1],
                          });
                          setSearchStaus(true);
                          // setRecentSearches([
                          //   ...recentSearches,
                          //   {
                          //     key,
                          //     data,
                          //     style,
                          //   },
                          // ]);
                          setTimeout(() => {
                            closeModal();
                          }, 1000);
                          // closeModal();
                        }}
                      >
                        <span>{data?.name}</span>
                        <br />
                        <span style={{ fontSize: "16px", marginLeft: "5px" }}>
                          {data?.province?.text}, {data?.country}
                        </span>
                        {console.log("data", data, selectedLocation)}
                        <input
                          type="radio"
                          checked={
                            selectedLocation?.city?.toLowerCase() ===
                              data?.name?.toLowerCase() &&
                            selectedLocation?.countryName?.toLowerCase() ===
                              data?.country?.toLowerCase()
                          }
                        />
                        <div className="check"></div>
                      </li>
                    ))}
              </ul>
            )}
          </TransitionMotion>
        </div>
      </div>
    </Modal>
  );
}

export default reduxForm({
  form: "LocationPopup", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  // validate
})(LocationPopup);
