const DIST = './public/dist';
const LIB = './public/lib';
const SASS = './public/sass';
const APP = './public/app';
const SIGN_UP = './public/sign-up-app';

module.exports = {
  dist: DIST,
  scripts: {
    dash: {
      src: [
        `${LIB}/jquery/dist/jquery.min.js`,
        `${LIB}/bowser/src/bowser.js`,
        `${LIB}/jquery-textfill/source/jquery.textfill.min.js`,
        `${LIB}/lodash/dist/lodash.min.js`,
        `${LIB}/tinycolor/dist/tinycolor-min.js`,
        `./public/materialize/js/bin/materialize.js`,
        `${LIB}/qrcode.js/qrcode.js`,
        `${LIB}/Download-File-JS/dist/download.min.js`,
        `${LIB}/angular/angular.min.js`,
        `${LIB}/angular-gravatar/build/angular-gravatar.min.js`,
        `${LIB}/restangular/dist/restangular.min.js`,
        `${LIB}/angular-PubSub/src/angular-pubsub.js`,
        `${LIB}/angular-stripe/release/angular-stripe.js`,
        `${LIB}/angular-animate/angular-animate.min.js`,
        `${LIB}/angular-materialize/src/angular-materialize.js`,
        `${LIB}/angular-ui-router/release/angular-ui-router.min.js`,
        `${LIB}/angular-resource/angular-resource.min.js`,
        `${LIB}/angular-file-upload/dist/angular-file-upload.min.js`,
        `${LIB}/angular-validation-match/dist/angular-validation-match.js`,
        `${LIB}/angular-gettext/dist/angular-gettext.js`,
        `${LIB}/angular-sortable-view/src/angular-sortable-view.min.js`,
        `${LIB}/angular-inview/angular-inview.js`,
        `${LIB}/highcharts/highcharts.js`,
        `${LIB}/moment/min/moment-with-locales.min.js`,
        `${LIB}/moment-timezone/moment-timezone-with-data-2010-2020.min.js`,
        `${LIB}/angular-moment/angular-moment.min.js`,
        `${LIB}/angular-ui-select/dist/select.min.js`,
        `${LIB}/ngstorage/ngStorage.min.js`,
        `${LIB}/angular-sanitize/angular-sanitize.min.js`,
        `${LIB}/ngSticky/dist/sticky.min.js`,
        `${LIB}/cropper/dist/cropper.js`,
        `${LIB}/angular-clipboard/angular-clipboard.js`,
        `${LIB}/ng-cropper/dist/ngCropper.min.js`,
        `${LIB}/object-id/object-id.js`,
        `${LIB}/ng-tags-input.min/ng-tags-input.min.js`,
        `${LIB}/angularjs-color-picker/dist/angularjs-color-picker.min.js`,
        `${DIST}/survey-editor.min.js`,
        `${LIB}/dragscroll/dragscroll.js`,

        `${LIB}/ngReact/ngReact.min.js`,

        `${APP}/**/*.module.js`,
        `${APP}/**/*.decorator.js`,
        `${APP}/**/*.super.js`,
        `${APP}/**/*.js`,
        `!${APP}/**/*.spec.js`
      ],
      templateCache: {
        src: [
          `${APP}/**/*.template.html`
        ],
        target: `${APP}`,
        root: '/app'
      },
      watch: [`${APP}/**/*.js`, `${DIST}/survey-editor.min.js`],
      min: 'dash.min.js'
    },
    signUp: {
      src: [
        `${LIB}/bowser/src/bowser.js`,
        `${LIB}/jquery/dist/jquery.min.js`,
        `${LIB}/lodash/dist/lodash.min.js`,
        `./public/materialize/js/bin/materialize.min.js`,
        `${LIB}/angular/angular.min.js`,
        `${LIB}/ngstorage/ngStorage.min.js`,
        `${LIB}/restangular/dist/restangular.min.js`,
        `${LIB}/angular-animate/angular-animate.min.js`,
        `${LIB}/angular-stripe/release/angular-stripe.js`,
        `${LIB}/angular-validation-match/dist/angular-validation-match.js`,
        `${LIB}/angular-materialize/src/angular-materialize.js`,
        `${LIB}/angular-ui-router/release/angular-ui-router.min.js`,
        `${SIGN_UP}/**/*.module.js`,
        `${SIGN_UP}/**/*.super.js`,
        `${SIGN_UP}/**/*.js`,
        `!${SIGN_UP}/**/*.spec.js`
      ],
      templateCache: {
        src: [
          `${SIGN_UP}/**/*.template.html`
        ],
        target: `${SIGN_UP}`,
        root: '/sign-up-app'
      },
      watch: [`${SIGN_UP}/**/*.js`],
      min: 'sign-up.min.js'
    }
  },
  styles: {
    dash: {
      src: [
        `${APP}/sass/main.scss`,
        `${DIST}/survey-editor.min.css`
      ],
      min: 'dash.min.css'
    },
    printResults: {
      src: `${SASS}/print-results/main.scss`,
      min: 'print-results.min.css'
    },
    printFeedbackList: {
      src: `${SASS}/print-feedback-list/main.scss`,
      min: 'print-feedback-list.min.css'
    },
    signUp: {
      src: `${SASS}/sign-up-app/main.scss`,
      min: 'sign-up.min.css'
    },
    signUpNew: {
      src: `${SASS}/sign-up-new/main.scss`,
      min: 'sign-up-new.min.css'
    }
  }
}
