var mongoose = require('mongoose')
var oid = mongoose.Types.ObjectId;

function unsubscribe(req, res){
  var id = req.params.id;
  const MESSAGE = req.query.lang === 'fi' ? "Kaikki viikkoyhteenvedot on nyt poistettu käytöstä." : "You have been unsubscribed from all weekly digests."

  try{
    var OID = oid(id);
  } catch(e) {
    console.log(e);
    return res.sendStatus(400);
  }

  if(id){
    var OID = oid(id);

      mongoose.connection.db.collection("users")
        .update({_id: OID}, {$set: {'settings.receive_digest': false}})
        .then(result => {
          res.send(`<h3>${MESSAGE}</h3>`)
        })
        .catch(err => res.sendStatus(400))
  } else res.sendStatus(400)

}


module.exports = { unsubscribe }
