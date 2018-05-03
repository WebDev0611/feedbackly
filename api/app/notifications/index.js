// Notifications

var mongoose = require('mongoose')
var oid = mongoose.Types.ObjectId;

function get(req, res){
    // get user devices
    // contruct query for notificationservice
}

function getById(req, res) {
  // get user devices
  // get by id && devices

}

function put(req, res){
  // get user devices
  // put appropriate fields
}

function post(req, res) {
  // get user devices
  // check device ids, post
}

function remove(req, res) {
  // get user devices
  // check device ids
  // remove
}


function unsubscribe(req, res){
  var notificationId = oid(req.params.id);
  var email = req.query.email;
  mongoose.connection.db.collection("notifications")
    .update({_id: notificationId}, {$pull: {receivers: {text: email}}})
    .then(result => {
      res.send("Successfully unsubscribed from the notification.")
    })
    .catch(err => res.sendStatus(400))

}


  function handleById(req, res){
    var id = req.params.id;
    const db = mongoose.connection.db;

    return res.send('<h1>Notification handled!</h1>');

    try{
      oid(id)
    } catch(e){
      return res.send(404)
    }


    db.collection('notificationreceipts')
    .update({notification_rule_id: oid(id), handled: {$exists: false}}, {$set: {handled: Math.floor(Date.now()/1000)}})
    .then(a => {
      res.send('<h1>Notification handled!</h1>')
    })
    .catch(err => {
      console.log(err);
      res.send('<h1>Something went wrong.</h1>')
    })


  }


module.exports = {post, put, get, getById, remove, unsubscribe, handleById}
