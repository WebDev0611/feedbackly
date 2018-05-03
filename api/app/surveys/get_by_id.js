/**
 * @api {get} /surveys/:id GET SURVEY BY ID
 * @apiName GetSurveyById
 * @apiGroup Survey
 * @apiVersion 1.0.0
 * @apiDescription Gets survey object with embedded question data
 * @apiParam {String} id Survey id
 * @apiSuccess {String} id Survey id
 * @apiSuccess {String} name Survey name
 * @apiSuccess {String} organization_id Organization_id
 * @apiSuccess {Object} properties Survey properties
 * @apiSuccess {Array} languages Available survey translations
 * @apiSuccess {Array} question_ids Survey question ids [String]
 * @apiSuccess {Array} questions Embedded Question objects for survey
 * @apiSuccess {Boolean} archived Survey is archived
 * @apiSuccess {Date} created_at Survey creation date ISOString
 */



 /*
 { 
    "_id" : ObjectId("5975f98c21e13400014853ca"), 
    "name" : "Example survey", 
    "organization" : ObjectId("5975f98c21e13400014853c4"), 
    "created_by" : ObjectId("5975f98c21e13400014853c3"), 
    "properties" : {
        "end_screen_text" : {
            "sv" : "Tack för din respons!", 
            "fi" : "Kiitos palautteestasi!", 
            "en" : "Thank you for your feedback!"
        }
    }, 
    "public" : false, 
    "generated" : true, 
    "languages" : [
        "en"
    ], 
    "question_ids" : [
        ObjectId("5975f98c21e13400014853c5"), 
        ObjectId("5975f98c21e13400014853c6"), 
        ObjectId("5975f98c21e13400014853c7"), 
        ObjectId("5975f98c21e13400014853c8"), 
        ObjectId("5975f98c21e13400014853c9")
    ], 
    "archived" : false, 
    "updated_at" : NumberInt(1500903443), 
    "created_at" : ISODate("2017-07-24T13:37:23.693+0000"), 
    "__v" : NumberInt(0)
}
*/

async function getById(){
  
}
  
module.exports = getById
  