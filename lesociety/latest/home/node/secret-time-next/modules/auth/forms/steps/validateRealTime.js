import _ from "lodash";
import { stopSubmit, updateSyncErrors } from "redux-form";
import axios from "axios";
import { apiRequest } from "../../../../utils/Utilities";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { logout } from "../../authActions";

export const existEmail = _.debounce(
  async (value, setLoader, setValid, dispatch, gender, error, setMailTest) => {
    if (value && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      setLoader(true);
      try {
        const res = await apiRequest({
          data: {
            email: value,
          },
          method: "POST",
          url: `user/validatebyEmail`,
        });
        if (res.data.data.isValid) {
          setLoader(false);
          setValid(true);
        } else {
          setLoader(false);
          setValid(false);
          // return res.data.message;
          if (gender === "male") {
            dispatch(
              stopSubmit("RegisterFormMale", {
                ...error,
                email: res.data.message,
              })
            );
          } else {
            dispatch(
              stopSubmit("RegisterForm", { ...error, email: res.data.message })
            );
          }
        }
        setMailTest(true);
      } catch (err) {
        setLoader(false);
        setMailTest(true);
        // dispatch(stopSubmit('RegisterForm', {email: 'checking'}))
        const router = useRouter();
        const dispatch = useDispatch();
        if (
          err?.response?.status === 401 &&
          err?.response?.data?.message === "Failed to authenticate token!"
        ) {
          setTimeout(() => {
            logout(router, dispatch);
          }, 100);
        }
        return err;
      }
    }
  },
  1000
);

export const existUsername = _.debounce(
  async (values, setLoader, setValid, dispatch, gender, error, setUserTest) => {
    if (values && values.length >= 3 && values.length <= 15) {
      setLoader(true);
      try {
        const res = await apiRequest({
          data: {
            user_name: values,
          },
          method: "POST",
          url: `user/validatebyUsername`,
        });
        if (res.data.data.isValid) {
          setLoader(false);
          setValid(true);
        } else {
          setLoader(false);
          setValid(false);
          if (gender === "male") {
            dispatch(
              stopSubmit("RegisterFormMale", {
                ...error,
                user_name: res.data.message,
              })
            );
          } else {
            dispatch(
              stopSubmit("RegisterForm", {
                ...error,
                user_name: res.data.message,
              })
            );
          }
        }
        setUserTest(true);
      } catch (err) {
        setLoader(false);
        setUserTest(true);
        // dispatch(stopSubmit('RegisterForm', {email: 'checking'}))
        const router = useRouter();
        const dispatch = useDispatch();
        if (
          err?.response?.status === 401 &&
          err?.response?.data?.message === "Failed to authenticate token!"
        ) {
          setTimeout(() => {
            logout(router, dispatch);
          }, 100);
        }
        return err;
      }
    }
  },
  1000
);

export const fetchLocation = async () => {
  try {
    const res = await apiRequest({
      method: "GET",
      url: `country`,
    });
    return res.data.data;
  } catch (err) {
    console.log(err);
    // Note: Cannot use hooks inside catch block - handle auth errors at component level
    if (
      err?.response?.status === 401 &&
      err?.response?.data?.message === "Failed to authenticate token!"
    ) {
      // Auth error will be handled by the component calling this function
      console.error("Authentication failed - token expired");
    }
    return err;
  }
};

export const fetchLiveLocation = async (lat, long, countries) => {
  try {
    const res = await axios({
      method: "GET",
      // url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?types=place%2Cpostcode%2Caddress&limit=1&access_token=${process.env.MAPBOX_TOKEN}`,
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?types=place%2Caddress&limit=1&access_token=${process.env.MAPBOX_TOKEN}`,
      params: {
        country: countries || undefined,
      },
    });
    if (res.data.features.length > 0) {
      const places = res.data.features.map((place) => {
        return {
          name: place.place_type?.includes("address")
            ? place.context.find((item) => item.id.includes("place"))?.text
            : place.text,
          country: place.context.filter((item) => item.id.includes("country")),
          label: place.place_type?.includes("address")
            ? place.context.find((item) => item.id.includes("place"))?.text
            : place.text,
          province: place.place_type?.includes("region")
            ? [
                {
                  id: "region",
                  short_code: place?.properties?.short_code,
                  text: place.text,
                },
              ]
            : place.context.filter((item) => item.id.includes("region")),
        };
      });
      return places;
    } else {
      return false;
    }
    return res.data.features;
  } catch (e) {
    console.log(e);
  }
};

// fetch cities of state from mapbox
export const fetchCities = async (state, country) => {
  // if (!state && !country) {
  //   return;
  // }

  try {
    const res = await axios({
      method: "GET",
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${country},${state}.json?types=place%2Cpostcode%2Caddress&limit=100&access_token=${process.env.MAPBOX_TOKEN}`,
      params: {
        country: "IN" || undefined,
      },

      // url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${state2}.json?types=place%2Cpostcode%2Caddress&limit=100&access_token=${process.env.MAPBOX_TOKEN}`,
      // url: `https://api.mapbox.com/geocoding/v5/mapbox.places/pune.json?types=place&limit=100&country=IN&region=maharashtra&access_token=${process.env.MAPBOX_TOKEN}`,
      // url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${country},${state}.json?types=region&limit=100&access_token=${process.env.MAPBOX_TOKEN}`,
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/d.json?types=region&country=us&limit=10&access_token=${process.env.MAPBOX_TOKEN}`,
    });
    console.log("res fetchCities", res);

    if (res.data.features.length > 0) {
      const places = res.data.features.map((place) => {
        return {
          name: place.place_type?.includes("address")
            ? place.context.find((item) => item.id.includes("place"))?.text
            : place.text,
          country: place.context.filter((item) => item.id.includes("country")),
          label: place.place_type?.includes("address")
            ? place.context.find((item) => item.id.includes("place"))?.text
            : place.text,
          province: place.place_type?.includes("region")
            ? [
                {
                  id: "region",
                  short_code: place?.properties?.short_code,
                  text: place.text,
                },
              ]
            : place.context.filter((item) => item.id.includes("region")),
        };
      });
      return places;
    } else {
      return false;
    }
    // return res.data.features;
  } catch (e) {
    console.log(e);
  }
};

export const fetchRealLocation = _.debounce(
  async (values, countries, setPlaces) => {
    if (values) {
      try {
        const res = await axios({
          url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${values}.json?types=place,postcode,address&access_token=${process.env.MAPBOX_TOKEN}`,
          params: {
            country: countries || undefined,
          },
        });
        if (res.data.features.length > 0) {
          const places = res.data.features.map((place) => {
            const province_code = place.place_type?.includes("region")
              ? place?.properties?.short_code?.toUpperCase()
              : place.context
                  .find((item) => item.id.includes("region"))
                  ?.short_code?.toUpperCase();
            return {
              name: place.text,
              country: place.context.filter((item) =>
                item.id.includes("country")
              ),
              label: place.text + ", " + province_code?.split("-")[1],
              province: place.place_type?.includes("region")
                ? [
                    {
                      id: "region",
                      short_code: place?.properties?.short_code,
                      text: place.text,
                    },
                  ]
                : place.context.filter((item) => item.id.includes("region")),
            };
          });
          setPlaces(places);
        } else {
          setPlaces([]);
          return false;
        }
      } catch (err) {
        console.log(err);
        setPlaces([]);
      }
    }
  },
  1000
);
