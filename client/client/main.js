jQuery.fn.scrollTo = function(elem) {
  try{
    $(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);
  } catch(e){console.warn(e)}

  return this;
};

window.app = require('./app/app')
$(document).ready(app.init);
