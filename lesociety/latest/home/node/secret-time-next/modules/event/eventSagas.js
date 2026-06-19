import { takeLatest, put } from "redux-saga/effects";

export function* createEvent(action) {
     
}

export default function* eventWatcher() {
  yield takeLatest("EVENT/CREATE", createEvent);
}
