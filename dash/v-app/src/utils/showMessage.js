import { SET_UI_MESSAGE } from "../constants/main";

export default function showMessage(commit, { text, color }) {
  commit(SET_UI_MESSAGE, { show: true, text, color }, { root: true });
}
