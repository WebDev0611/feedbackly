/* eslint-disable */
import { get, set } from 'lodash'
import { vueSet } from 'vue-deepset'


export const createObjectMutation = (objectPath) => {
  return function (state, action) {
    if (!get(state, objectPath)) throw Error('Path you`re trying to edit does not exist')
    let { path, value } = action;
    if (path) path = "." + path;
    vueSet(state, `${objectPath}${path || ''}`, value)
  }
}