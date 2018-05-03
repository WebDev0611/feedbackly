var Fns = require('../app/functions');
var chai = require('chai')
var expect = chai.expect;

var _ = require('lodash')
var globals = {}
require('../set-env')
var sendEmail = require('../app/mailer/send')

describe("Functions Unit tests", () => {

  describe("getUpsellsFromDevice", () => {

    it("should get upsells from device", () => {
      var device = {
        upsells: {
          neutral: 'ObjectId1',
          positive: 'ObjectId2',
          negative: 'ObjectId3',
        }
      }

      var result = Fns.getUpsellsFromDevice(device);

      expect(result.neutral).to.equal('ObjectId1')
      expect(result.positive).to.equal('ObjectId2')
      expect(result.negative).to.equal('ObjectId3')

    })

    it("should not throw error if upsells don't exist", () => {
      var device = {}
      var result = Fns.getUpsellsFromDevice(device);

      expect(result).to.deep.equal({})
    })

  })

  describe("calculateAverageOfFbevents", () => {
    it("should calculate correctly with NPS", () => {
      var fbevents = require('./fbevents').NPS; //0.2
      var result = Fns.calculateAverageOfFbevents(fbevents);

      expect(result).to.equal(0.2)

    })

    it("should calculate correctly with Button", () => {
      var fbevents = require('./fbevents').Button; //0.5
      var result = Fns.calculateAverageOfFbevents(fbevents);

      expect(result).to.equal(0.5)

    })

    it("should calculate correctly with Slider", () => {
      var fbevents = require('./fbevents').Slider; //0.41
      var result = Fns.calculateAverageOfFbevents(fbevents);

      expect(result).to.equal(0.41)

    })

    it("should calculate correctly with All", () => {
      var fbevents = require('./fbevents').All; //0.3875
      var result = Fns.calculateAverageOfFbevents(fbevents);

      expect(result).to.equal(0.39)

    })

    it("should calculate correctly with other question types", () => {
      var fbevents = require('./fbevents').others; //0.3875
      var result = Fns.calculateAverageOfFbevents(fbevents);

      expect(result).to.equal(null)

    })

  })

  describe("getUpsellByAverage", () => {

    var upsells = {
        neutral: 'neu',
        positive: 'pos',
        negative: 'neg',
    }

    it("should get positive upsell with >0.5 average", () => {
      var result = Fns.getUpsellByAverage(upsells, 0.53);
      expect(result).to.equal('pos');
    })

    it("should get negative upsell with <0.5 average", () => {
      var result = Fns.getUpsellByAverage(upsells, 0);
      expect(result).to.equal('neg');
    })

    it("should get neutral upsell with 0.5 average", () => {
      var result = Fns.getUpsellByAverage(upsells, 0.50);
      expect(result).to.equal('neu');
    })

    it("should get neutral upsell when average cannot be calculated", () => {
      var result = Fns.getUpsellByAverage(upsells, null);
      expect(result).to.equal('neu');
    })

    it("should get neutral upsell when positive or negative is missing", () => {
      var upsells = {neutral: 'neu'}
      var result1 = Fns.getUpsellByAverage(upsells, 0.7);
      var result2 = Fns.getUpsellByAverage(upsells, 0.1);
      expect(result1).to.equal('neu');
      expect(result2).to.equal('neu');
    })

    it("should return null when upsells are missing", () => {
      var upsells = {}
      var result = Fns.getUpsellByAverage(upsells, 0.7);
      expect(result).to.equal(null);
    })

  })

  describe("buildEmailFromUpsell", () => {

    var upsell = {
      code: 'ABC123',
      barcode: {
          type: 'code39',
          showText: true
      },
      image_url: 'http://cdn3-www.cattime.com/assets/uploads/2011/08/best-kitten-names-1.jpg',
      heading: 'This is a heading',
      subtitle: 'This is the subtitle',
      text: 'This is the text body'
    }

    globals.upsell = upsell;

    var result = Fns.buildEmailFromUpsell(upsell, ['test1@email.com', 'test2@email.com']);

    it("should have first to-email", () => {
      expect(result).to.have.deep.property("personalizations[0].tos[0].email", "test1@email.com")
    })

    it("should have second to-email", () => {
      expect(result).to.have.deep.property("personalizations[0].tos[1].email", "test2@email.com")
    })

    it("should have a heading substitution", () => {
      expect(result).to.have.deep.property('personalizations[0].substitutions.{{heading}}', "This is a heading");
    })

    it("should have a subtitle substitution", () => {
      expect(result).to.have.deep.property("personalizations[0].substitutions.{{subtitle}}", "This is the subtitle");
    })

    it("should have a text substitution", () => {
      expect(result).to.have.deep.property("personalizations[0].substitutions.{{text}}", "This is the text body");
    })

    it("should have the image substitution", () => {
      expect(result).to.have.deep.property("personalizations[0].substitutions.{{image_url}}", "http://cdn3-www.cattime.com/assets/uploads/2011/08/best-kitten-names-1.jpg");
    })

    it("should have the barcode image tag", () => {
      var tags = require('../app/constants').imageTag;
      expect(result).to.have.deep.property("personalizations[0].substitutions.{{barcode_image}}",
      tags[0] + "https://barcode.feedbackly.com/?bcid=code39&text=ABC123&includetext" + tags[1]);
    })

    it("should have an empty substitution if no barcode is needed", () => {
      upsell.barcode = null;
      var result = Fns.buildEmailFromUpsell(upsell, ['test1@email.com', 'test2@email.com']);
      expect(result).to.have.deep.property("personalizations[0].substitutions.{{barcode_image}}", '');
    })




  })


})
