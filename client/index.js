/* global document */
import App from "./App.html";
import { Store } from "svelte/store.js";

const store = new Store({
  application: "",
  applications: [],
  authorization: `Basic ${document.cookie.split("=")[1]}`,
  closed: false,
  endOfList: false,
  fetchPending: false,
  limit: 50,
  offset: 50,
  report: null,
  reports: [],
});

export default new App({ store, target: document.body });
