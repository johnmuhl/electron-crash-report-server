/* global document */
import { init } from "sapper/runtime.js";
import { manifest } from "./manifest/client.js";
import { Store } from "svelte/store.js";

const store = data => new Store(data);

init({
  manifest,
  store,
  target: document.querySelector("#sapper"),
});
