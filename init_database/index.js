var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;
var bcrypt   = require('bcrypt-nodejs');

var url = 'mongodb://localhost:27017/feedbackly-test';
const EMAIL = 'developer@feedbackly.com';
const PASS =  'developer1234';

async function start(){

  try{
    var db = await MongoClient.connect(url);
    var Organization = db.collection('organizations')
    var User = db.collection('users')


    var org = {
      "name" : "Developer organization",
      "segment" : "SOLUTION_SALES",
      "customership_state" : "ACTIVE",
      "can_use_upsell" : true,
      "can_create_channels" : true
    }


    var insertedOrganization = await Organization.insertOne(org);
    const ORGID = insertedOrganization.insertedId;

    const PWD = bcrypt.hashSync(PASS, bcrypt.genSaltSync(8), null);

    var u = {
        "email" : EMAIL,
        "displayname" : "Developer",
        "password" : PWD,
        "organization_id" : [
            ORGID
        ],
        "system_admin" : true,
        "settings" : {
            "locale" : "en",
            "active" : true,
            "timezone" : "120",
            "receive_digest" : false,
            "send_device_notifications" : false
        },
        "organization_admin" : [
          ORGID
        ],
        "v4" : true,
        "email_confirmed" : true,
        "default_organization" : ORGID,
        "tutorials_finished" : [

        ],
        "segment" : "SOLUTION_SALES"
      }

      const insertedUser = await User.insertOne(u)
      const USER_ID = insertedUser.insertedId;

      var devicegroup =  {
        "name" : "All channels",
        "is_base_devicegroup" : true,
        "is_all_channels_group" : true,
        "devices" : [
        ],
        "organization_id" : ORGID,
        "type" : "DEVICE",
        "v4" : true
      }

      var insertedGroup = await db.collection("devicegroups").insertOne(devicegroup);
      const DEVICEGROUP_ID = insertedGroup.insertedId;

      var organizationRight =
      {
          "organization_id" : ORGID,
          "user_id" : USER_ID,
          "rights" : {
              "devicegroups" : [
                DEVICEGROUP_ID
              ],
              "survey_create" : true
          }
      }

      await db.collection("organizationrights").insertOne(organizationRight)


      console.log(`Done. You can now log in with username ${EMAIL} and password: ${PASS}`)
      process.exit()


  } catch(err){
    console.log(err);
  }
}

start();
