const utils = require('../utils')

describe("#utils", function(){
  describe("#getProcessedState", function(){
    it("should get processed state true from feedback without inbox assign", function(){
      const result = utils.getProcessedState({processed: true}, {mode: "all"});
      result.should.equal(true)
    })

    it("should get processed state true from feedback with inbox assign", function(){
      const result = utils.getProcessedState({processed: true, processedByGroup: [{group_id: "1", processed: true}]}, {mode: "group_assigned", user_groups: ["1"]});
      result.should.equal(true)
    })

    it("should get processed state false from feedback with inbox assign, and no content", function(){
      const result = utils.getProcessedState({processed: false, processedByGroup: []}, {mode: "group_assigned", user_groups: ["1"]});
      result.should.equal(false)
    })

    it("should get processed state false from other user group processing", function(){
      const result = utils.getProcessedState({processed: false, processedByGroup: [{group_id: "2", processed: true}]}, {mode: "group_assigned", user_groups: ["1"]});
      result.should.equal(false)
    })
  })
})