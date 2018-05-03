// auth.js
var passport = require("passport");
var passportJWT = require("passport-jwt");

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }
    return token;
};

var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;
var params = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest:   ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeader(),  cookieExtractor ])
};

var User = require('../app/models/user')

module.exports = function() {
    var strategy = new Strategy(params, function(payload, done) {
    if(payload.expiration_date > Date.now()){
      User.findOne({_id: payload.id })
      .then(user => {
        if (user) {
            user._activeOrganizationId = payload.oid;
            if(payload.method == 'admin') user.loggedInFromAdmin = true
            return done(null, user);
        } else {
            return done(new Error("User not found"), null);
        }
      })
    } else return done(new Error("Token expired"), null)

    });

    passport.use(strategy);

    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", {session: false, failureRedirect: '/'});
        }
    };
};
