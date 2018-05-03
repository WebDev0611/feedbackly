import update from 'immutability-helper';
import _ from 'lodash';


function omitStringValues(obj, key) {
  if (_.isArray(obj)) return _.map(obj, (o) => omitStringValues(o, key));
  if (!_.isPlainObject(obj)) return obj;
  const filtered = _.omitBy(obj, (v, k) => _.isString(v) && k === key);
  return _.mapValues(filtered, v => omitStringValues(v, key));
}



export default function reducer(state, action) {
  switch (action.type) {
  case 'REMOVE_LANGUAGE':
    return omitStringValues(state, action.language);
  case 'REMOVE_CHOICE':
    if (_.get(state, `logic.${action.questionId}.${action.id}`))
      return update(state, {
        logic: {
          [action.questionId]: {
            [action.id]: {
              '$set': undefined
            }
          }
        }
      })
    else return state;
  case 'DELETE_QUESTION':
    if (_.get(state, `logic.${action.questionId}`))
      return update(state, {
        logic: {
          [action.questionId]: {
            '$set': undefined
          }
        }
      });
    else return state;


  }

  return state;
}
