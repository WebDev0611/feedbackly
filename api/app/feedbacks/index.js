const getters = require('./get_get_by_id')

function remove(){}

module.exports = { getById: getters.getById, remove, get: getters.get }


/**
 * @api {get} /feedbacks/:id GET FEEDBACK BY ID
 * @apiName GetFeedbackById
 * @apiGroup Feedback
 * @apiVersion 1.0.0
 * @apiDescription Gets a single Feedback object by id.
 *
 * @apiParam {String} id Feedback object's unique ID.
 *
 * @apiSuccess {String} _id object's unique ID.
 * @apiSuccess {String} survey_id  Survey unique id.
 * @apiSuccess {String} channel_id  Feedback channel's unique id.
 * @apiSuccess {String} created_at Feedback object's created at date in ISOString format.
 * @apiSuccess {Object} meta_browser Browser and device data
 * @apiSuccess {Array} meta Metadata
 * @apiSuccess {String} meta.key Key of the metadata
 * @apiSuccess {String} meta.val Value of the metadata
 * @apiSuccess {String} language Language the survey was answered in
 * @apiSuccess {Array} data Feedback data array containing responses to individual questions
 * @apiSuccess {Mixed} data.value Feedback data value [String] | String | Float
 * @apiSuccess {String} data.question_id Question id of the response
 * @apiSuccess {String} data.question_type Question type of the response Button | NPS | Word | Image | Text | Slider | Contact


 */

