var expect= require("chai").expect;
var buttonImages = require('../lib/button_images');

describe("ButtonImages", () => {
  describe("should get the correct urls", () => {

    it("should get 4a.gif for feedbackly style animated 0.25", () => {
      var url = buttonImages.getUrl({animated: true, plain: false}, 0.25)
      expect(url).to.have.string('4a.gif')
    })

    it("should get 3b.png for plain style nonanimated string", () => {
      var url = buttonImages.getUrl({animated: false, plain: true}, "0.50")
      expect(url).to.have.string('3b.png')
    })


  })

})
