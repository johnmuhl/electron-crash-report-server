/* global document */
import App from "./App.html";
import { Store } from "svelte/store.js";

const store = new Store({
  application: "",
  applications: [],
  authorization: `Basic ${document.cookie.split("=")[1]}`,
  closed: false,
  report: null,
  reports: [],
});

export default new App({ store, target: document.body });
