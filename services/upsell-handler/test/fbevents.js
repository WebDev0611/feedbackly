var nps = [
  {question_type: 'NPS', data: [0.1]},
  {question_type: 'NPS', data: [0.2]},
  {question_type: 'NPS', data: [0.3]}
]

var button = [
  {question_type: 'Button', data: [0]},
  {question_type: 'Button', data: [0.5]},
  {question_type: 'Button', data: [1]}
]

var slider = [
  {question_type: 'Slider', data: [{data: 0.1}, {data: 0.2}, {data: 0.3}]},
  {question_type: 'Slider', data: [{data: 1}, {data: 0.5}, {data: 1}]},
  {question_type: 'Slider', data: [{data: 0.2}, {data: 0.5}, {data: 0.1}, {data: 0.2}]}
]

var others = [
  {question_type: 'Word', data: ['weifw']},
  {question_type: 'Upsell', data: [{data: 'aaaaaaaa'}]},
  {question_type: 'Text', data: ['Hello therre']}
]


module.exports = {NPS: nps, Button: button, Slider: slider, others, All: [...nps, ...button, ...slider, ...others]}
