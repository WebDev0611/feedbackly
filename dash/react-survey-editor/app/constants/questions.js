import _ from 'lodash';
var all = [
  {type: 'Button', name: 'Smileys', icon: 'mood', tr: true},
  {type: 'NPS', name: 'NPS ®', icon: 'filter_1', tr: false},
  {type: 'Word', name: 'Word choices', icon: 'style', tr: true},
  {type: 'Text', name: 'Open question', icon: 'format_quote', tr: true},
  {type: 'Slider', name: 'Slider', icon: 'tune', tr: true},
  {type: 'Image', name: 'Image', icon: 'photo', tr: true},
  {type: 'Contact', name: 'Form', icon: 'create', tr: true},
  {type: 'Upsell', name: 'Upsell', icon: 'attach_money', tr: true},
]
export default all;
export var dict = _.keyBy(all,'type');



if(process.env.NODE_ENV === 'development') {
  
}
