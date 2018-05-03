const jwt = require('jwt-simple');
const SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');
const oid = mongoose.Types.ObjectId;
const _ = require('lodash')

function isLoggedIn(){
  return async function(req, res, next){
    const rights = await validateAPIToken(req, res);
    req.rights = rights;
    next()
  }
}


async function validateAPIToken(req, res, next){
  try{
    const authHeader = req.headers['authorization'];
    if(!authHeader) return res.status(401).json({error: 'Authentication failed. Authorization header is not present'});
    const token = authHeader.split("JWT ")[1]
    if(!token) return res.status(401).json({error: 'Authentication failed. Authorization header token not found. It must be in the format "JWT <token>" '});
    const decoded = jwt.decode(token, SECRET);
    if(decoded.expiration_date < Date.now()) return res.status(401).json({error: 'Authentication failed. Authorization token has expired.'});
    if(decoded.api_key_id){ // this is a API key
      const tokenFromDb = await mongoose.connection.db.collection('apikeys').findOne({_id: oid(decoded.api_key_id)});
      if(!tokenFromDb || tokenFromDb.revoked == true) return res.status(401).json({error: 'Authorization failed. Token wasn`t found or it has been revoked.'});
    } 
    
    const Rights = mongoose.connection.db.collection('organizationrights');
    const rightsToChannelgroups = await Rights.findOne({user_id: oid(decoded.user_id), organization_id: oid(decoded.organization_id)});
    if(!rightsToChannelgroups) return res.status(401).json({error: 'Authorization failed. Api key doesn`t have access to any resources.'});
    const groups = rightsToChannelgroups.rights;
    const devicegroups = await mongoose.connection.db.collection("devicegroups").find({_id: {$in: groups.devicegroups}}).toArray();
    if(!devicegroups) return res.status(401).json({error: 'Authorization failed. Api key doesn`t have access to any resources.'});

    const rights = {
      device_ids: _.flatten(devicegroups.map(dg => dg.devices)),
      organization_id: oid(decoded.organization_id)
    }

    if(next){
      req.rights = rights;
      next()
    } else return rights;
  } catch(e){
    console.log('Authentication failed.', e);
    return res.status(400).json({error: 'Authentication failed. Check your auth token.'})
  }
}

module.exports = { isLoggedIn }
