var mirror = require('keymirror');

var constants = {
  billing: mirror({ PAYING: null, TRIAL: null, DEACTIVATED: null }),
  segment: mirror({ SOLUTION_SALES: null, SELF_SIGNUP: null, TEST: null }),
  trial: {
    TRIAL_DAYS: 30
  },
  customership: mirror({
    ACTIVE: null,
    TERMINATED: null,
    TEST: null
  })
};

module.exports = constants;
