import { createStore, applyMiddleware, compose } from 'redux';
import { surveyToState } from './state';
import thunk from 'redux-thunk';
import rootReducer from '../modules/reducer';
import Perf from 'react-addons-perf'
window.Perf = Perf;


const I = {
  '_id':'5847bfb1cdcd1700ef189e40',
  'name':'Example survey',
  'organization':'5847bfb0cdcd1700ef189e35',
  'created_by':'5847bfb0cdcd1700ef189e34',
  '__v':0,
  'properties':{
    'question_timeout':'5',
    'end_screen_text':{
      'en':'Thank you for your feedback!',
      'fi':'Kiitos palautteestasi!',
      'sv':'Tack för din respons!'
    }
  },
  'generated':true,
  'languages':[
    'en'
  ],
  'question_ids':[
    {
      '_id':'5847bfb0cdcd1700ef189e36',
      'organization_id':'5847bfb0cdcd1700ef189e35',
      'created_by':'5847bfb0cdcd1700ef189e34',
      'question_type':'Button',
      '__v':0,
      'has_feedback': true,
      'heading':{
        'en':'How would you rate our customer service today?'
      },
      'opts':{
        'buttonCount':5,
        'buttonStyle':{
          'plain': true,
          'animated': true
        }
      },
      'choices':[
        {
          'id':'000',
          'text':{
            'en':'TERRIBLE.'
          }
        },
        {
          'id':'025',
          'text':{
            'en':'BAD.'
          }
        },
        {
          'id':'050',
          'text':{
            'en':'OK.'
          }
        },
        {
          'id':'075',
          'text':{
            'en':'GOOD.'
          }
        },
        {
          'id':'100',
          'text':{
            'en':'AWESOME.'
          }
        }
      ],
      'generated':true,
      'createdAt':'2016-12-06T14:04:17.499Z'
    },
    {
      '_id':'5847bfb0cdcd1700ef189e38',
      'organization_id':'5847bfb0cdcd1700ef189e35',
      'created_by':'5847bfb0cdcd1700ef189e34',
      'question_type':'Word',
      '__v':0,
      'has_feedback': true,
      'heading':{
        'en':'Where did you see our advert last?'
      },
      'choices':[
        {
          'id':'0',
          'text':{
            'en':'Newspaper'
          },
          'has_feedback': true,
        },
        {
          'id':'1',
          'text':{
            'en':'TV'
          },
          'has_feedback': false,
        },
        {
          'id':'2',
          'text':{
            'en':'Website'
          },
          'has_feedback': true,
        },
        {
          'id':'3',
          'text':{
            'en':'Google'
          },
          'has_feedback': false,
        },
        {
          'id':'4',
          'text':{
            'en':'Facebook'
          },
          'has_feedback': true,
        },
        {
          'id':'5',
          'text':{
            'en':'I haven\'t seen'
          },
          'has_feedback': false,
        }
      ],
      'generated':true,
      'createdAt':'2016-12-06T14:04:17.499Z'
    },
    {
      '_id':'5847bfb0cdcd1700ef189e3a',
      'organization_id':'5847bfb0cdcd1700ef189e35',
      'created_by':'5847bfb0cdcd1700ef189e34',
      'question_type':'NPS',
      '__v':0,
      'has_feedback': false,
      'heading':{
        'en':'How likely would you recommend us to a friend or a colleague?'
      },
      'subtitle':{
        'en':'10 = extremely likely, 0 = extremely unlikely'
      },
      'choices':[

      ],
      'generated':true,
      'createdAt':'2016-12-06T14:04:17.499Z'
    },
    {
      '_id':'5847bfb0cdcd1700ef189e3c',
      'organization_id':'5847bfb0cdcd1700ef189e35',
      'created_by':'5847bfb0cdcd1700ef189e34',
      'question_type':'Text',
      'has_feedback': false,
      '__v':0,
      'heading':{
        'en':'How could we improve our service?'
      },
      'placeholder':{
        'en':''
      },
      'choices':[

      ],
      'generated':true,
      'createdAt':'2016-12-06T14:04:17.499Z'
    },
    {
      '_id':'5847bfb0cdcd1700ef189e3e',
      'organization_id':'5847bfb0cdcd1700ef189e35',
      'created_by':'5847bfb0cdcd1700ef189e34',
      'question_type':'Contact',
      '__v':0,
      'has_feedback': false,
      'heading':{
        'en':'Subscribe to our newletter to receive monthly offers to your inbox!'
      },
      'choices':[
        {
          'id':'0',
          'text':{
            'en':'Name'
          },
          'type':'string'
        },
        {
          'id':'1',
          'text':{
            'en':'Email'
          },
          'type':'string'
        }
      ],
      'generated':true,
      'createdAt':'2016-12-06T14:04:17.499Z'
    },
    {
         "_id":"58c67b8130abbd3a3b49de77",
         "__v":0,
         "organization_id":"5847bfb0cdcd1700ef189e35",
         "opts":{
            "show_labels":false
         },
         "subtitle":{

         },
         "heading":{
            "en":"e"
         },
         "question_type":"Image",
         "choices":[
            {
               "id":"58c67b9330abbd3a3b49de79",
               "text":{
                  "en":"aaa"
               },
               "url":"https://s3-eu-west-1.amazonaws.com/tapin/uploads/58c67b92f24f760655ec2189.png"
            },
               {
                  "id":"abcdefgegfhfgh",
                  "text":{
                     "en":"aaa2"
                  },
                  "url":"https://s3-eu-west-1.amazonaws.com/tapin/uploads/58c67b92f24f760655ec2189.png"
               },
         ],
         "generated":false,
         "createdAt":"2017-03-13T10:59:01.675Z"
      }
  ],
  'archived':false,
  'updated_at':1483955948
}

export default function configureStore(initialState = surveyToState(I)) {
  const middleware = window.__REDUX_DEVTOOLS_EXTENSION__ ?
  compose(applyMiddleware(thunk), window.__REDUX_DEVTOOLS_EXTENSION__()) :
  applyMiddleware(thunk);
  initialState.user = { canUseUpsell: true, canUseLogic: true, organizationAdmin: true};
  const store = createStore(
    rootReducer,
    initialState,
    middleware
  );

  return store;
}
