export const SHOW_CIRCLE_ANIMATION = 'SHOW_CIRCLE_ANIMATION';
export const HIDE_CIRCLE_ANIMATION = 'HIDE_CIRCLE_ANIMATION';

export function createCircleAnimation({ x, y, color }) {
  return dispatch => {
    dispatch(showCircleAnimation({ x, y, color }));

    let timeout = setTimeout(() => {
      clearTimeout(timeout);

      dispatch(hideCircleAnimation());
    }, 800);
  }
}

export function showCircleAnimation({ x, y, color }) {
  return {
    type: SHOW_CIRCLE_ANIMATION,
    x,
    y,
    color
  }
}

export function hideCircleAnimation() {
  return {
    type: HIDE_CIRCLE_ANIMATION
  }
}
