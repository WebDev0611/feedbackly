/* eslint-disable */
import moment from 'moment';
import { orderBy } from 'lodash'

export const date = (str, format) => {
  if(str && str.length > 0) return moment(str).format(format || "DD.MM.YYYY HH:mm");
  else return '';
}

export const orderAlphabetically = (array, key) => orderBy(array, key);
