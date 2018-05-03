const mongoose = require('mongoose');
function isValidObjectId(oid){
  try{
    mongoose.Types.ObjectId(oid)
    return true;
  } catch(e){
    return false;
  }
}

module.exports = {isValidObjectId}