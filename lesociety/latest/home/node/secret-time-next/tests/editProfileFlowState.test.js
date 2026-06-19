const test = require("node:test");
const assert = require("node:assert/strict");

const {
  loadEditProfileFlowState,
  saveEditProfileFlowState,
  clearEditProfileFlowState,
  buildStep2InitialValues,
  buildStep3InitialValues,
} = require("../utils/editProfileFlowState");

const createSessionStorage = () => {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
};

test.beforeEach(() => {
  global.window = {
    sessionStorage: createSessionStorage(),
  };
});

test.afterEach(() => {
  delete global.window;
});

test("resumes edit profile step 0 draft after refresh", () => {
  const user = {
    tagline: "Live tagline",
    description: "Live description",
    images: ["live-1.jpg", "live-2.jpg"],
  };

  saveEditProfileFlowState({
    page: 0,
    step2Draft: {
      tagline: "Draft tagline",
      description: "Draft description",
      imageUpload: "draft-1.jpg",
    },
  });

  const restoredState = loadEditProfileFlowState();
  const initialValues = buildStep2InitialValues({
    user,
    isEdit: true,
    draft: restoredState.step2Draft,
  });

  assert.equal(restoredState.page, 0);
  assert.equal(initialValues.tagline, "Draft tagline");
  assert.equal(initialValues.description, "Draft description");
  assert.equal(initialValues.imageUpload, "draft-1.jpg");
  assert.equal(initialValues.imageUpload2, "live-2.jpg");
});

test("resumes edit profile step 1 draft after refresh", () => {
  const user = {
    height: 170,
    max_education: "College Degree",
    is_smoker: "No",
    occupation: "Engineer",
  };

  saveEditProfileFlowState({
    page: 1,
    step3Draft: {
      height: 177,
      max_education: "Graduate Degree",
      is_smoker: "Yes",
      occupation: "Scientist",
    },
  });

  const restoredState = loadEditProfileFlowState();
  const initialValues = buildStep3InitialValues({
    user,
    draft: restoredState.step3Draft,
  });

  assert.equal(restoredState.page, 1);
  assert.equal(initialValues.height, 177);
  assert.equal(initialValues.max_education, "Graduate Degree");
  assert.equal(initialValues.is_smoker, "Yes");
  assert.equal(initialValues.occupation, "Scientist");
});

test("resumes preview step after refresh without losing queued review data", () => {
  const user = {
    un_verified_tagline: "Queued tagline",
    un_verified_description: "Queued description",
    un_verified_images: ["queued-1.jpg"],
    un_verified_profile_details: {
      height: 181,
      occupation: "Founder",
    },
  };

  saveEditProfileFlowState({ page: 2 });
  const restoredState = loadEditProfileFlowState();

  const step2Values = buildStep2InitialValues({
    user,
    isEdit: true,
    draft: restoredState.step2Draft,
  });
  const step3Values = buildStep3InitialValues({
    user,
    draft: restoredState.step3Draft,
  });

  assert.equal(restoredState.page, 2);
  assert.equal(step2Values.tagline, "Queued tagline");
  assert.equal(step2Values.description, "Queued description");
  assert.equal(step2Values.imageUpload, "queued-1.jpg");
  assert.equal(step3Values.height, 181);
  assert.equal(step3Values.occupation, "Founder");
});

test("clears persisted state when edit flow completes", () => {
  saveEditProfileFlowState({
    page: 2,
    step2Draft: { tagline: "Draft tagline" },
  });

  clearEditProfileFlowState();

  assert.deepEqual(loadEditProfileFlowState(), {
    page: 0,
    step2Draft: null,
    step3Draft: null,
  });
});
