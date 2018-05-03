// statistics for Marketing and SaaS performance


/* 
- "Amount of surveys created in time range
- Amount of feedback in time range
- Number of new users
- Total number of users
            - Subscription type (segment: SELF-SIGNUP/SOLUTION SALES)
            - Plan type (FREE/SMALL/GROWTH/COMPANY…)
    - (Total amount paid across time)
    - (Last payment made at)
- Last login by a user	
- Number of logins across all users in time range	
- Number of logins in total
- Organization created at
- First login
- Method of signup (iPad/Web)
*/

const moment = require('moment')
const _ = require('lodash')

const getSurveyAmount = require('./surveys').getSurveyAmount;
const getFeedbackAmount = require('./feedbacks').getFeedbackAmount;
const getUserAmount = require('./users').getUserAmount;
const getLastLoginInOrganizations = require('./logins').getLastLoginInOrganizations;
const getNumberOfLogins = require('./logins').getNumberOfLogins;
const getOrganizationDetails = require('./organization').getOrganizationDetails;

function formatDate(date){
    if(date) return moment.utc(date).format('DD.MM.YY HH:mm')
    else return ''
}

function formatDateInUnix(date){
    if(date) return moment.utc(date).unix()
    else return ''
}

async function get(req, res){

    // get parameters

    try{
    const fromDate = moment.utc(parseInt(req.query.start) || moment.utc().subtract(1, 'week')).startOf("day").toDate()
    const toDate = moment.utc(parseInt(req.query.end) || moment.utc()).endOf("day").toDate()

    const params = {
        fromDate,
        toDate
    }


    const [surveyAmount,
            totalSurveys,
           feedbackAmount,
           totalFeedbacks,
           userAmount, 
           totalUserAmount,
           lastLogins,
            numberOfLogins,
            totalLogins,
            organizationDetails ] = await Promise.all([
         getSurveyAmount(params),
         getSurveyAmount(),
         getFeedbackAmount(params),
         getFeedbackAmount(),         
         getUserAmount(params), // new users
         getUserAmount(), // all users
         getLastLoginInOrganizations(params),
         getNumberOfLogins(params),
         getNumberOfLogins(),         
         getOrganizationDetails()
    ]);
    
    const returnObject = {
        surveyAmount,
        totalSurveys,
       feedbackAmount,
       totalFeedbacks,
       userAmount, 
       totalUserAmount,
       lastLogins,
        numberOfLogins,
        totalLogins,
        organizationDetails
    };

    let rows = createRowsFromData(returnObject);

    const columns = [
        {id: '_id', label: 'Organization id'},
        {id: 'name', label: 'Organization name'},
        {id: 'subscription', label: 'Subscription type'},
        {id: 'plan', label: 'Plan type'},
        {id: 'signupMethod', label: 'Signup method'},
        {id: 'surveyCount', label: 'Survey count in range'},
        {id: 'totalSurveys', label: 'Total survey count'},
        {id: 'feedbackCount', label: 'Feedback count in range'},
        {id: 'totalFeedbackCount', label: 'Total feedback count'},
        {id: 'userCount', label: 'User count in range'},
        {id: 'totalUserCount', label: 'Total user count'},
        {id: 'lastLogin', label: 'Last login', sortId: 'lastLoginUnix'},
        {id: 'loginCount', label: 'Login count in range'},
        {id: 'totalLoginCount', label: 'Total login count'},
        {id: 'organizationCreatedAt', label: 'Organization created', sortId: 'organizationCreatedAtUnix'},
    ];

    const sort = req.query.sort;
    const direction = -1;

    if(sort){
        rows = _.sortBy(rows, row => direction*row[sort])
    }

    if(req.query.render){
        res.render('stats/stats', {rows, columns, params: {start: moment(params.fromDate).unix()*1000, end: moment(params.toDate).unix()*1000}})
    } else res.send(rows)

    } catch(e){
        console.log(e)
        console.log('error in main')
        res.setStatus(500).send(e)
    }


}

function createRowsFromData(data){

    const rows = data.organizationDetails.map((organization, index) => {

        let row = {
            index,
            _id: organization._id || '',
            name: organization.name || '',
            subscription: organization.segment || '',
            plan: organization.plan || '',
            signupMethod: organization.signupMethod || ' ',
            organizationCreatedAtUnix: moment.utc(organization.created_at).unix(),            
        }


        row = Object.assign(row, {
            surveyCount: _.get(_.find(data.surveyAmount, {_id: {organization_id: row._id}}), 'count') || 0,
            totalSurveys: _.get(_.find(data.totalSurveys, {_id: {organization_id: row._id}}), 'count') || 0,
            feedbackCount: _.get(_.find(data.feedbackAmount, {_id: {organization_id: row._id}}), 'count') || 0,
            totalFeedbackCount: _.get(_.find(data.totalFeedbacks, {_id: {organization_id: row._id}}), 'count') || 0,
            userCount: _.get(_.find(data.userAmount, {_id: {organization_id: row._id}}), 'count') || 0,
            totalUserCount: _.get(_.find(data.totalUserAmount, {_id: {organization_id: row._id}}), 'count') || 0,
            lastLogin: formatDate(_.get(_.find(data.lastLogins, {_id: row._id}), 'lastLoginDate')),
            lastLoginUnix: formatDateInUnix(_.get(_.find(data.lastLogins, {_id: row._id}), 'lastLoginDate')),            
            loginCount: _.get(_.find(data.numberOfLogins, {_id: {organization_id: row._id}}), 'count') || 0,
            totalLoginCount: _.get(_.find(data.totalLogins, {_id: {organization_id: row._id}}), 'count') || 0,
            organizationCreatedAt: moment.utc(organization.created_at || 0).format("DD.MM.YYYY HH:mm"),
        })
        return row
    })

    return rows
}


module.exports = { get }