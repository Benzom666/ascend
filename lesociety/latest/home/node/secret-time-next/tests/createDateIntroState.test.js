const test = require("node:test");
const assert = require("node:assert/strict");

const {
  markCreateDateIntroSkipOnce,
  consumeCreateDateIntroSkipOnce,
} = require("../utils/createDateIntroState");

const createLocalStorage = () => {
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
    localStorage: createLocalStorage(),
  };
});

test.afterEach(() => {
  delete global.window;
});

test("consumes the first-login intro skip flag only once per user", () => {
  const user = { user_name: "alice" };

  markCreateDateIntroSkipOnce(user);

  assert.equal(consumeCreateDateIntroSkipOnce(user), true);
  assert.equal(consumeCreateDateIntroSkipOnce(user), false);
});

test("keeps intro skip flags isolated per user", () => {
  markCreateDateIntroSkipOnce({ user_name: "alice" });

  assert.equal(consumeCreateDateIntroSkipOnce({ user_name: "bob" }), false);
  assert.equal(consumeCreateDateIntroSkipOnce({ user_name: "alice" }), true);
});
