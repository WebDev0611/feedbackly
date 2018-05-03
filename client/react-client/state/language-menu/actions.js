export const TOGGLE_LANGUAGE_MENU = 'TOGGLE_LANGUAGE_MENU';
export const SHOW_LANGUAGE_MENU = 'SHOW_LANGUAGE_MENU';
export const HIDE_LANGUAGE_MENU = 'HIDE_LANGUAGE_MENU';

export function showLanguageMenu() {
  return {
    type: SHOW_LANGUAGE_MENU
  }
}

export function hideLanguageMenu() {
  return {
    type: HIDE_LANGUAGE_MENU
  }
}

export function toggleLanguageMenu() {
  return {
    type: TOGGLE_LANGUAGE_MENU
  }
}
