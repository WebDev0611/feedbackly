/* V3 reitit
ipad.tapin.fi/?udid=1
ipad.tapin.fi/mobile/?udid=1
ipad.tapin.fi/mobile-new/udid
ipad.tapin.fi/ipad/udid
ipad.tapin.fi/ipad-new/udid

V4 reitit

fbly.io/ipad/build/udid
fbly.io/surveys/udid
fbly.io/l/tinylink

Eli nämä reitit uuteen serveriin
/?udid=1                 => V3 udid tarkistuksen kautta redirect v3.feedbackly.com/ipad/udid            muuten 404
/mobile?udid=1           => V3 udid tarkistuksen kautta redirect v3.feedbackly.com/mobile-new/udid      muuten 404
/mobile-new/udid         => V3 udid tarkistuksen kautta redirect v3.feedbackly.com/mobile-new/udid      muuten 404
/ipad/udid               => V3 udid tarkistuksen kautta redirect v3.feedbackly.com/ipad/udid            muuten 404
/ipad-new/udid           => V3 udid tarkistuksen kautta redirect v3.feedbackly.com/ipad/udid            muuten 404
/ipad/build/udid         Ei redirectiä. alun udid {udid: xxx, passcode: xxxx} vasta aktivoitu jos build on numero ja yli 1504
/surveys/udid            Ei redirectiä
/l/tinylink              Ei redirectiä
*/

var Promise = require("bluebird");
var MongoDB = Promise.promisifyAll(require("mongodb"));
var MongoClient = Promise.promisifyAll(MongoDB.MongoClient);

var db;

function connectToOldMongo() {
    var url = process.env.OLD_MONGO_URL;
    if (!db) {
        db = MongoClient.connectAsync(url); //This returns a promise!
    }
    return db;
};

function redirectToV3Route(type, udid, res, next){
  var root = "https://client-test-46249.onmodulus.net"
  if(type=="ipad") res.redirect(root+'/ipad/' + udid);
  else res.redirect(root+'/mobile-new/' + udid);
}


function findOldRedirect(req, res, next){
  var udid = req.query.udid || req.params.udid || req.params.build;
  var type = req.originalUrl.indexOf('mobile') >-1 ? 'mobile' : 'ipad';
  if(udid){
    console.log("checking udid from old mongo")
    connectToOldMongo().then(function(db) {
      return db.collection("devices").findOne({"udid": udid})
      .then(device => {
        if(device){
          return db.collection("organizations").findOne({"_id": device.organization_id})
          .then(org => {
            console.log(org)
            if(org && !org.v4 || org.v4 != true){
              return redirectToV3Route(type, udid, res, next)
            } else next();
          }).catch(err => {
            console.log(err);
            next(err)
          })

        } else next();
      }).catch(err => {
          console.log(err);
          next(err);
      });
    });

  } else next();
}

var findOldUdid = (udid) => {
  return connectToOldMongo().then(function(db) {
    return db.collection("devices").findOne({"udid": udid})
  });
}



module.exports = {findOldRedirect, findOldUdid};
