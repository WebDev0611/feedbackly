(function() {

  class Buttons {
    /*@ngInject*/
    constructor($filter, colorConstants) {
      this._$filter = $filter;
      this._colorConstants = colorConstants;
    }

    buttonValueToClass(value, opts) {
      var mapper = this.newMapper();
      var className = `face-thumb face-${mapper[value]}`;

      className+= _.get(opts, 'plain') ? " plain" : '';
      className+= _.get(opts, 'animated') ? " animated" : '';
      return className;
    }

    mapper(value){
      var mapper = {
        '100': '100',
        '075': '075',
        '066': '075',
        '050': '050',
        '033': '025',
        '025': '025',
        '000': '000'
      };

      if(_.isNumber(value)) {
        mapper = {
          '1': '100',
          '0.75': '075',
          '0.66': '075',
          '0.5': '050',
          '0.33': '025',
          '0.25': '025',
          '0': '000'
        };
      }
      return mapper;
    }

    newMapper(value){

      var mapper = {
        /*'100': '1',
        '075': '2',
        '066': '2',
        '050': '3',
        '033': '4',
        '025': '4',
        '000': '5',*/
        '1': '1',
        '0.75': '2',
        '0.66': '2',
        '0.5': '3',
        '0.33': '4',
        '0.25': '4',
        '0': '5'
      };


      return mapper;

    }


    buttonTranslation(count){
      if(count == 5){
        var obj = {
        "100": "",
        "075": "",
        "050": "",
        "025": "",
        "000": ""
        }
      }

      if(count == 4){
        var obj = {
        "100": "",
        "066": "",
        "033": "",
        "000": ""
        }
      }
      return obj || {}
    }

    buttonValueToImage(value, format, opts) {
      // opts = { plain: Bool, animated: Bool}

      var mapper = this.newMapper(value);
      var imageName = mapper[value.toString()];
      imageName+= _.get(opts, 'plain') ? 'b' : 'a';
      var ext = _.get(opts, 'animated') ? 'gif' : 'png';
      var filepath = `/images/faces/${imageName}.${ext}`;
      return filepath;
    }

    buttonValueToColor(value) {
      var map = {
        '1': this._colorConstants.primaryColors.TEAL,
        '0.75': this._colorConstants.primaryColors.GREEN,
        '0.66': this._colorConstants.primaryColors.GREEN,
        '0.5': this._colorConstants.primaryColors.YELLOW,
        '0.33': this._colorConstants.primaryColors.ORANGE,
        '0.25': this._colorConstants.primaryColors.ORANGE,
        '0': this._colorConstants.primaryColors.RED
      };

      return map[value.toString()];
    }

    buttonTitles(buttonCount) {
      var allTitles = [
        { title: 'Amazing.', class: 'teal-text', value: '100' },
        { title: 'Good.', class: 'green-text', value: '075' },
        { title: 'Ok.', class: 'yellow-text', value: '050' },
        { title: 'Bad.', class: 'orange-text', value: '025' },
        { title: 'Terrible.', class: 'red-text', value: '000' }
      ];

      var titles = buttonCount == 4
        ? [...allTitles.slice(0, 2), ...allTitles.slice(3,5)]
        : allTitles;

      return _.map(titles, t => { return { title: this._$filter('translate')(t.title), class: t.class, value: t.value } });
    }

    buttonValues(buttonCount = 5) {
      if(buttonCount === 5) {
        return [0, 0.25, 0.5, 0.75, 1];
      } else {
        return [0, 0.33, 0.66, 1];
      }
    }

    buttonImages(options) {
      var format = options.format || 'svg'
      var values = options.buttonCount == 4 ? ['1', '0.66', '0.33', '0'] : ['1', '0.75', '0.5', '0.25', '0'];

      return _.map(values, value => this.buttonValueToImage(value, format));
    }
  }

  angular.module('tapinApp.services')
    .service('Buttons', Buttons);

})();
