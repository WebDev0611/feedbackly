var expect= require("chai").expect;
var Filters = require('../app/functions/filters');

describe("Fbevent notification filters", () => {
  describe("contains", () => {
    it("returns true if contained", () => {
      var contained = Filters.contains([0, 2], 0)
      expect(contained).to.equal(true);
    })

    it("returns true if contained (array)", () => {
      var contained = Filters.contains([1,2.50,3], [1, 2.50000])
      expect(contained).to.equal(true);
    })

    it("returns true if contained (array)", () => {
      var contained = Filters.contains(['One', 'Two', 'Three'], ['One', 'Two'])
      expect(contained).to.equal(true);
    })

    it("returns false if all array values are not contained (array)", () => {
      var contained = Filters.contains(['One', 'Two', 'Three'], ['One', 'Two', 'Four'])
      expect(contained).to.equal(false);
    })


    it("returns true if all array values are contained", () => {
      var contained = Filters.contains("Today's gonna be the day", ["gonna", "the", "day"])
      expect(contained).to.equal(true);
    })

    it("returns true even if case doesn't match", () => {
      var contained = Filters.contains("I'm gonna KILL you!", ["gonna", "kill", "YOU"])
      expect(contained).to.equal(true);
    })

    it("returns false if not contained", () => {
      var contained = Filters.contains("TIMMY", "TIMMYI")
      expect(contained).to.equal(false);
    })

    it("returns false if all array values are not contained", () => {
      var contained = Filters.contains("That's not a moon. It's a space station!", ["moon", "station", "ewok"])
      expect(contained).to.equal(false);
    })
  })

  describe("containsOne", () => {
    it("returns true if 1 is contained", () => {
      var contained = Filters.containsOne("Gina used work at the docks.", ["Lenny", "Timmy", "Gina", "Bert"])
      expect(contained).to.equal(true);
    })

    it("returns true if is contained (array)", () => {
      var contained = Filters.containsOne(['Facebook', 'Fox news', 'Newspaper'], ['Tinder', 'Twitter', 'Uber', 'Fox news'])
      expect(contained).to.equal(true);
    })

    it("returns false if not contained", () => {
      var contained = Filters.containsOne(5, [0,2,3,4])
      expect(contained).to.equal(false);
    })

    it("returns false if is not contained (array)", () => {
      var contained = Filters.containsOne([1,2,3,4], [5,6,7,8])
      expect(contained).to.equal(false);
    })

    
  })

  describe("length", () => {
    it("returns true with rule >3 and hello", ()=> {
      var result = Filters.length("hello", "3", ">")
      expect(result).to.equal(true);
    })

    it("returns false with rule <3 and hello", ()=> {
      var result = Filters.length("hello", "3", "<")
      expect(result).to.equal(false);
    })
  })


  describe("equals", () => {
    it("'smoothie' === 'smoothie'", ()=> {
      var result = Filters.equals("smoothie", "smoothie")
      expect(result).to.equal(true);
    })

    it("returns false with 1 === 2", ()=> {
      var result = Filters.equals(1, 2)
      expect(result).to.equal(false);
    })
  })

  describe("isGreaterOrLess", () => {
    it("returns true with 4 > 3", ()=> {
      var result = Filters.isGreaterOrLess(4, ">3")
      expect(result).to.equal(true);
    })

    it("returns false with 5 >= 8", ()=> {
      var result = Filters.equals(5, ">=8")
      expect(result).to.equal(false);
    })
  })

})
