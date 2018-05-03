var BASE = 'https://survey.feedbackly.com/dist/images/faces';

function valuesToNumbers(value){
  var val = parseFloat(value).toString();
  var map = {
    '0': '5',
    '0.25': '4',
    '0.33': '4',
    '0.5': '3',
    '0.66': '2',
    '0.75': '2',
    '1': '1'
  }

  return map[val]
}

function getUrl(style, value) {
  var imageNumber = valuesToNumbers(value)
  var extension = style.animated ? '.gif' : '.png';
  var path = style.plain ? `${BASE}/plain/${imageNumber}b${extension}` : `${BASE}/default/${imageNumber}a${extension}`
  return path
}


module.exports = { getUrl }
