var LockQ = require('./../../app/utils/check_locked_input');

function open() {
  var $menu = $(".current-question .language-menu");

  $menu.show();

  $menu.find('.flag-icon-' + window.currentLanguage).addClass('active');

  var showTimeout = setTimeout(()=>{
    $menu.addClass("show");

    clearTimeout(showTimeout);
  }, 10);

 var k=0;

 $menu.find('.flag-icon').each(function(){
   k+=70;

   var $this = $(this)
   var scaleTimeout = setTimeout(function(){
     $this.addClass("scale-in");
     clearTimeout(scaleTimeout);
   }, k);
 })

 LockQ.lock()
}


function closeTouch(e){
    if(!e.target.className || (e.target.className.indexOf("language-menu") == -1 && e.target.className.indexOf("flag") == -1)){
       close();
    }
}

function changeLang(){
  var $this = $(this);
  var lang = $this.attr("value");

  PubSub.publish('CHANGE_LANGUAGE', lang);

  close();
}


function close() {
  var $menu = $(".current-question .language-menu");

  $menu.removeClass("show")

  var timeout = setTimeout(()=>{
    $menu.hide();

    $('.flag-icon').removeClass('scale-in active');

    clearTimeout(timeout);
  }, 300)

  LockQ.unlock()
}

function destroy(){
  $(document).off("touchstart", ".language", open)
}

function init(){
  destroy();

  $('html.no-touchevents').on('click', function() { close.bind(this)(); });
  $('html.touchevents').on('touchstart', function() { close.bind(this)(); });

  $('.touchevents .language-menu .flag-icon').on("touchstart", function(e) { changeLang.bind(this)(); e.stopPropagation() });
  $('.no-touchevents .language-menu .flag-icon').on("click", function(e) { changeLang.bind(this)(); e.stopPropagation() });

  $('.touchevents .language-menu').on('touchstart', function(e) { e.stopPropagation(); });
  $('.no-touchevents .language-menu').on('click', function(e) { e.stopPropagation() });

  $('.language').on('touchstart', e => { open.bind(this)(); e.stopPropagation() });
  $('.language').on('click', e => { open.bind(this)(); e.stopPropagation() })
}


module.exports = {open, close, init}
