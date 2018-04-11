/* global document window */
import App from "./App.html";

const app = new App({ target: document.body });

window.app = app;

export default app;
