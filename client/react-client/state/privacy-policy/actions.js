export const SHOW_PRIVACY_POLICY = 'SHOW_PRIVACY_POLICY';
export const HIDE_PRIVACY_POLICY = 'HIDE_PRIVACY_POLICY';
export const TOGGLE_PRIVACY_POLICY = 'TOGGLE_PRIVACY_POLICY';

export function showPrivacyPolicy() {
  return {
    type: SHOW_PRIVACY_POLICY
  }
}

export function hidePrivacyPolicy() {
  return {
    type: HIDE_PRIVACY_POLICY
  }
}

export function togglePrivacyPolicy() {
  return {
    type: TOGGLE_PRIVACY_POLICY
  }
}
