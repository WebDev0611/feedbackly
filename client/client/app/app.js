var Keyboard = require('../components/keyboard/keyboard.component')
var TitleResizer = require("../components/titleResizer")
var Nps = require('../components/question_types/nps/nps.component')
var Button = require('../components/question_types/button/button.component')
var Contact = require('../components/question_types/contact/contact.component')
var Scrolling = require('../components/scrolling');
var Slider = require('../components/question_types/slider/slider.component');
var Image = require('../components/question_types/image/image.component');
var Text = require('../components/question_types/text/text.component');
var Word = require('../components/question_types/word/word.component');
var Fbevent = require('./fbevents/fbevents')
var PingRefresh = require('./utils/ping-refresh');
var TimerScreen = require('../components/timer-screen/timer-screen.component.js');
var Timer = require('./utils/timer');
var LanguageMenu = require('../components/language_menu/language_menu.component')
var Settings = require('./utils/settings')
var PrivacyPolicy = require('../components/privacy-policy/privacy-policy');
var languageInUse;

require('./utils/tablet');

var pubSubTokens = [], currentQuestionIndex=-1;

var self = {
  init: function(){
    window.currentLanguage = default_language;

    PingRefresh.init();
    Keyboard.init()
    Button.init()
    Contact.init()
    Scrolling.init()
    Slider.init()
    Image.init()
    Nps.init()
    Text.init()
    Word.init();
    Fbevent.init()
    LanguageMenu.init()
    PrivacyPolicy.init();
    Settings();

    $(".question-type").css("visibility", "hidden")

    if(!$('body').hasClass('ipad')) {
      TimerScreen.disable();
    }

    $(window).on("resize", self._resizeWindow);

    Timer.onChange(value => {
      TimerScreen.init();

      if(value === 0) {
        PubSub.publish('BACK_TO_BEGINNING');
      }
    });

    self._resizeWindow();

    pubSubTokens.push(PubSub.subscribe('NEXT_QUESTION', self._nextQuestion))
    pubSubTokens.push(PubSub.subscribe('BACK_TO_BEGINNING', self._backToBeginning))
    pubSubTokens.push(PubSub.subscribe('CHANGE_LANGUAGE', self._changeLanguage))
    pubSubTokens.push(PubSub.subscribe('SAVE_FROM_JS', self._saveFromJS));

    $(document).on("touchstart", "body", () => {
      if(Timer.running() && !$(".current-question").hasClass('survey-end')) Timer.restart()
    })

    window.initFromClient = function(){
      PubSub.publish('BACK_TO_BEGINNING'); // oikeasti pitää inittaa
    }

    if(window.PREFILLED.question && window.PREFILLED.value) {
      currentQuestionIndex=0;
      Fbevent.saveFromQuery();
    }
    else PubSub.publish('NEXT_QUESTION');

    if(!$("body").hasClass("ipad")) $("body").addClass("no-ipad"); // TODO: laita järkevämmin backendin puolelle
  //  if(navigator.agent.indexOf("indows") > -1) $("body").addClass("windows")

    $(".spinner").hide();
    window.initReady = true;
    PubSub.publish('INIT_READY');
  },

  _nextQuestion: function(e, question_id){
    var lengthOfSurvey =  $(".question-type").length;
    $(".question-type").removeClass('current-question')
    var i = currentQuestionIndex;
    var nextQuestionIndex = i+1;

    if(question_id){
      var logicIndex = $(".question-type[question-id="+ question_id + "]").index();
      if(question_id == "end") logicIndex = lengthOfSurvey;
      if(logicIndex > 0) nextQuestionIndex = logicIndex;
    }

    var $question = $(".question-type").eq(nextQuestionIndex);

    if($question.length === 0) {
      $question = $(".survey-end");
    }

    var translate = "translateX(" + (-100 + nextQuestionIndex/lengthOfSurvey*100) + "%)"

    $(".progress-bar .progress").css({"transform": translate})

    $question.css("visibility", "visible");

    if(nextQuestionIndex > 0) {
      if(!$('body').hasClass('ipad') || $question.hasClass('survey-end')) {
        TimerScreen.disable();
      } else {
        TimerScreen.enable();
      }

      if($question.hasClass('survey-end')) {
        Timer.setValue(window.SURVEY_END_RETURN_TIME);
      } else if($('body').hasClass('ipad')) {
        Timer.setValue(window.SURVEY_RETURN_TIME);
      }

      Timer.start();
    }

    if(nextQuestionIndex == lengthOfSurvey) messageClient({"action": 'surveyFinished'})

    self._resizeWindow()


    setTimeout(function(){
      $question.addClass("fly-in current-question");
      if(i>-1) $(".question-type").eq(i).addClass("fly-out")
      $("input, textarea").blur();
      $("html, body").animate({ scrollTop: 0, scrollLeft: 0 }, 250);
      self._showTranslation($question);
      Keyboard.hideKeyboard();


      setTimeout(function(){
        $question.find('button, .image-container, .cont').addClass('scale-in');
        $(".question-type").not('.current-question').css("visibility", "hidden");
        currentQuestionIndex = nextQuestionIndex
        $("input, textarea").blur();
        TitleResizer.resizeElement(".current-question .title");
      }, 300)

    },1)
  },

  _resizeWindow: function(){
    var innerH = $(window).innerHeight();
    var innerW = $(window).innerWidth();
    if(innerW > innerH) $("body").addClass("landscape");
    else $("body").removeClass("landscape");
    $(".question-inner").css("min-height", innerH);

    if($("body").hasClass('web') || $("body").hasClass('mobile')){
      if(innerW < 650) $("body").removeClass('web').addClass('mobile');
      else $("body").removeClass('mobile').addClass('web');
    }

    PubSub.publish('WINDOW_RESIZE')
  },

  _showTranslation: function($question){

    var $title = $question.find(`.title.lang-${currentLanguage}`);
    if($title.length == 0){
      $title = $question.find(`.title.lang-${default_language}`);
      if($title.length == 0){
        $title = $question.find('.title.lang').first();
      }
    }

    var language = $title.attr("class").split("lang-")[1].split(" ")[0];
    if (!$question.hasClass('survey-end')) languageInUse = language;

    $question.find('.lang').addClass('hide');
    $question.find(`.lang-${languageInUse}`).removeClass('hide');

    $(".timer-screen").find('.lang').addClass('hide');
    $(".timer-screen").find('.lang-' + languageInUse).removeClass('hide');

    var langCount = $question.find('.language-menu .flag-icon').length;
    if(langCount < 2) {
      $('.language').hide();
    } else {
      $('.language').show();
    }
  },

  _backToBeginning: function(){
    Fbevent.init();
    Timer.stop();
    Keyboard.hideKeyboard();
    TimerScreen.hide();

    if(!$('body').hasClass('ipad')) {
      if (window.REDIRECT !== undefined){ return window.location.replace(window.REDIRECT); }
      else return;
    }

    $(".current-question").addClass('fly-out');
    setTimeout(function(){
      currentQuestionIndex = -1;
      currentLanguage = default_language;
      $(".question-type, .survey-end").css("visibility", "hidden")
      $(".question-type, .survey-end").removeClass('current-question fly-in fly-out')
      $(".input[locked=true]").attr("locked", "false")
      $(".scale-in").removeClass('scale-in');
      $(".press").removeClass('press');
      $(".input-box .text").html("")
      $(".input-box .text").width(0);
      $(".input-box").attr("data", "");
      $(".no-animation").removeClass("no-animation")
      Slider.init();
      PubSub.publish('NEXT_QUESTION');
    }, 300)
  },

  _changeLanguage: function(e,lang){
    window.currentLanguage = lang;

    var $currentQuestion = $(".current-question");
    self._showTranslation($currentQuestion)

    TitleResizer.resizeElement(".current-question .title");
  },

  _saveFromJS: function(){

    if(window.PREFILLED.question && window.PREFILLED.value) {
      currentQuestionIndex=0;
      Fbevent.init();
      Fbevent.saveFromQuery();
    }
  },

  destroy: function(){
    TimerScreen.destroy();
    Timer.reset();
    Keyboard.destroy()
      _.forEach(pubSubTokens, function(token){
        PubSub.unsubscribe(token);
      });
  },
}

module.exports = self;
