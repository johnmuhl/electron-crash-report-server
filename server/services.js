import types from "./types";
function sendTo(type, data) {
  switch (type) {
    case types.BACKTRACE:
      sendToBacktrace(data);
      break;
    case types.METABASE:
      sendToMetabase(data);
      break;
    default:
      console.log("No service selected")
      break;
  }
}


const sendToBacktrace = (data) => {
  console.log("sendToBacktrace")
}

const sendToMetabase = (data) => {
  console.log("sendToMetabase")
}
export { sendTo };