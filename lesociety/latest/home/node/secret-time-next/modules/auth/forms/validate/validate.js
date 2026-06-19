const validate = (values) => {
  const errors = {};
  if (!values.user_name) {
    errors.user_name = "Username is Required";
  } else if (values.user_name.length < 3) {
    errors.user_name = "Min 3 characters Required";
  } else if (values.user_name.length > 15) {
    errors.user_name = "Username should not longer than 15 characters";
  }
  if (!values.email) {
    errors.email = "Email is Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }
  if (!values.password) {
    errors.password = "Password is Required";
  } else if (values.password.length < 6) {
    errors.password = "Min 6 characters Required";
  }
  if (!values.tagline) {
    errors.tagline = "* Min 8 - Max 100 characters";
  } else if (values.tagline.length < 8) {
    errors.tagline = "* Min 8 - Max 100 characters";
  } else if (values.tagline.length > 100) {
    errors.tagline = "* Min 8 - Max 100 characters";
  }
  if (!values.description) {
    errors.description = "* Min 30 - Max 500 characters";
  } else if (values.description.length < 30) {
    errors.description = "* Min 30 - Max 500 characters";
  } else if (values.description.length > 500) {
    errors.description = "* Min 30 - Max 500 characters";
  }
  if (!values.date_description) {
    errors.date_description = "* Min 20 - Max 500 characters";
  } else if (values.date_description.length < 20) {
    errors.date_description = "* Min 20 - Max 500 characters";
  } else if (values.date_description.length > 500) {
    errors.date_description = "* Min 20 - Max 500 characters";
  }
  if (!values.offer) {
    errors.offer = "* Min 30 - Max 500 characters";
  } else if (values.offer.length < 30) {
    errors.offer = "* Min 30 - Max 500 characters";
  } else if (values.offer.length > 500) {
    errors.offer = "* Min 30 - Max 500 characters";
  }
  if (!values.imageUpload) {
    errors.imageUpload = "Image is Required";
  }
  if (!values.location?.value) {
    errors.location = "Location is Required";
  }
  if (!values.enter_country?.value) {
    errors.enter_country = "Country is Required";
  }
  if (!values.enter__category) {
    errors.enter__category = "Category is Required";
  }
  if (!values.enter__aspiration) {
    errors.enter__aspiration = "Aspiration is Required";
  }
  if (!values.enter_city) {
    errors.enter_city = "City name is Required";
  }

  if (!values.max_education) {
    errors.max_education = "Please select education level";
  }
  if (!values.is_smoker) {
    errors.is_smoker = "Please select";
  }
  if (!values.occupation) {
    errors.occupation = "Please select your occupation";
  }
  if (!values.ethnicity) {
    errors.ethnicity = "Please Select Ethnicity";
  }
  if (!values.body_type) {
    errors.body_type = "Please Select body type";
  }
  if (!values.age) {
    errors.age = "Age is Required";
  } else if (values.age < 18) {
    errors.age = "* Minimum 18 years";
  } else if (values.age > 99) {
    errors.age = "* Maximun 99 years";
  }
  if (!values.favoriteColor) {
    errors.favoriteColor = "Required";
  }
  return errors;
};

export default validate;
