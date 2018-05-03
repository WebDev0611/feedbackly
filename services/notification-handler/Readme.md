### Notification backend documentation

####Purpose

Feedbacks flow in from the queue. (Simulated in the api/seeder.js file)
The application is supposed to match these feedbacks to rules specified in the database collection Notificationrules.

####Getting started

Have MongoDB and Redis running in localhost. And then run:

	npm install

The main app is run:

	node app/index.js

The seeder is a helper function to simulate Fbevents coming in from outside

	node app/seeder.js


##### Notificationrules object

	{
		id: String,
		device_id: String, the fbevents are matched by this
		conditionSet: Array with conditions that should match before sending the notification.
		receivers: An array of people who will receive the notification,
		messageContentFromQuestionIds: Array of question ids from which to take the Notification content. This will be the fbevent's (with the question id) data field.

	}


The conditionset array contains objects such as this:

	{
		question_id: String, the question_id that this condition applies to
		key: the key of the data in the fbevent object that is matched with the conditions
		conditions: these are the functions and their parameters that are matched with the data of the fbevent object.

	}

Items in the "and" array will all have to return true for the data. In addition to the "and" array, the "or" array can contain additional parameters that one of them needs to be true. (If there are conditions in both the "and" & "or" arrays, all of the conditions in the "and" array will need to be true AND at least 1 condition from the "or" array.)

Full example:


	    {
      _id: "1",
      device_id: "575572a7f39049e6001f1c07" ,
      conditionSet: [
        {
          question_id: "5757bb0e66752be500d5c2a3",
          key: "data[0]",
          conditions: {
            and: [{fn: "length", value: ">3"}],
            or: []
          }
        },
        {
          question_id: "5757bb0e66752be500d5c29f",
          key: "data[0]",
          conditions: {
            and: [],
            or: [{fn: "contains", value: 0.66 }, {fn: "contains", value: 1 }]
          }
        }
      ],
      receivers: [{
        type: "email",
        to: "test@testcom.com"
      }],
      messageContentFromQuestionIds: ["5757bb0e66752be500d5c2a3"]
    }

##### FBEVENT object

These are the feedbacks that will come in from the job queue as inputs.
It contains many fields but the for this project only a couple apply.
Together, many fbevents form a virtual object that is joined by "feedback_id". So every time a fbevent is processed, all the fbevents with the same "feedback_id" are pulled out of the database. Fbevents have different "question_id"-fields and the rules in the Notificationrules object are matched by the question_id.

When all the question_ids that are in the conditionSet of a notificationrules object have arrived to the database, the notification is sent if all conditions match the data. The notificationRules conditionSet objects have the field "key" which refers to the field where the data lies in the fbevent object. For instance, in the above example the key "data[0]" refers to fbevent.data[0], the first element in the "data" array in the fbevent object.

	question_id: String
	feedback_id: String
	device_id: String
	data: Array with mixed content (Mostly Float or String)
	created_at_adjusted_ts: Integer with the timestamp

Example (with only relevant fields)

	{
   	 	question_id : "5757bb0e66752be500d5c2a5",
    	feedback_id : "5838737b55025b7da9d2d933",
	    device_id : "575572a7f39049e6001f1c07",
    	data : [
        	0.9
	    ],
    	created_at_adjusted_ts : 1480101832
    }

## PROCESS

1. Reads Fbevent
2. Gets Fbevent's device_id
3. Finds Notification Rules by device_id
4. If there are matching rules, read the data from the "key" field
		eg. fbevent.data[0]
5. Find conditions from the conditionset of the notificationrule object by question_id
6. Use the functions specified in the "fn" to match the rules
7. If the rules match (see above) return the message content object for further processing.
