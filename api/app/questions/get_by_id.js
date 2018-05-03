/**
 * @api {get} /questions/:id GET QUESTION BY ID
 * @apiName GetQuestion
 * @apiGroup Question
 * @apiVersion 1.0.0
 * @apiDescription Gets question objects by their id
 *
 * @apiParam {String} id Question id
 * 
 * @apiSuccess {String} id Question id
 * @apiSuccess {Object} opts Question options
 * @apiSuccess {String} organization_id Organization id
 * @apiSuccess {Date} created_at Question creation date in ISOString
 * @apiSuccess {Array} [choices] Details on the choices. Present in Word, Image, Contact and Slider question types.
 * @apiSuccess {String} [choices.id] The id of the choice. This is equivalent to the value in a given feedback response's data.value field
 * @apiSuccess {Object} [choices.text] Object containing each translation with language code as key eg. {text: {en: "First name", fi: "Etunimi"}}
 * @apiSuccess {String} [choices.type] (Only Contact question type) type of field: string | boolean
 * @apiSuccess {Object} subtitle The subtitle for the question containing each translation with language code as key eg. {text: {en: "Subtitle", fi: "Alateksti"}}
 * @apiSuccess {Object} heading The main title for the question containing each translation with language code as key eg. {text: {en: "Heading", fi: "Otsikko"}}
 * @apiSuccess {String} question_type The type of the question. Button | NPS | Word | Image | Text | Slider | Contact

 */

 const mongoose = require('mongoose');
 const oid = mongoose.Types.ObjectId;
 const OUTPUT_FIELDS = {id: '$_id', _id: 0, opts: 1, organization_id: 1, created_at: "$createdAt", choices: 1, subtitle: 1, heading: 1, question_type: 1 }
 const _ = require('lodash');

 function trimQuestion(originalQuestion){
    const q = Object.assign({}, originalQuestion)
    q.question_type != 'Slider' && _.get(q,'opts.smallScale') != null ? delete q.opts.smallScale : '';
    _.get(q,'opts.buttonStyle.animated') != null ? delete q.opts.buttonStyle.animated : '';
    _.get(q,'opts.colored') != null ? delete q.opts.colored : '';
    _.get(q,'opts.showSkip') != null ? delete q.opts.showSkip : '';
    
    return q;
 }

 async function getById(req, res){
    try{
        let id;
        try{ id = oid(req.params.id); }
        catch(e){ return res.status(400).json({error: 'Invalid question id.'})}
        const Question = mongoose.connection.db.collection("questions");    
        const organization_id = _.get(req, 'rights.organization_id');
        
        const query = {_id: id, organization_id: organization_id};
        const question = await Question.aggregate([{$match: query}, {$project: OUTPUT_FIELDS}]).toArray();
        if(!question[0]) return res.status(404).send({error: 'Question not found'});
        const trimmedQuestion = trimQuestion(question[0]);
        return res.send(trimmedQuestion)
    } catch(e){
        return res.status(500).json({error: 'Something went wrong'});
    }
 }
/*
{ 
    "_id" : ObjectId("597c366abbdea8e15fd56ec1"), 
    "__v" : NumberInt(0), 
    "opts" : {
        "smallScale" : false
    }, 
    "organization_id" : ObjectId("597c35825d0570000174de7e"), 
    "createdAt" : ISODate("2017-07-31T02:44:17.229+0000"), 
    "created_by" : ObjectId("597c35825d0570000174de7d"), 
    "choices" : [
        {
            "type" : "string", 
            "text" : {
                "en" : "First Name"
            }, 
            "id" : "597c3764bbdea8e15fd56ec2"
        }, 
        {
            "type" : "string", 
            "text" : {
                "en" : "Last name"
            }, 
            "id" : "597c378bbbdea8e15fd56ec4"
        }
    ], 
    "subtitle" : {
        "en" : "We want to get to know you"
    }, 
    "heading" : {
        "en" : "Tell us a little about yourself "
    }, 
    "question_type" : "Contact"
}
*/


 module.exports = {OUTPUT_FIELDS, getById, trimQuestion}