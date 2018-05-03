import { get } from "lodash";
import { SET_UI_MESSAGE } from "../constants/main";

export default function errorHandler(commit, error, timeout = 3500) {
  let text = get(error, "response.error") || error;
  if (error.response === {} && error.status >= 500)
    text = "Internal server error";
  commit(
    SET_UI_MESSAGE,
    { show: true, text, color: "error", timeout },
    { root: true }
  );
  throw new Error(text);
}
