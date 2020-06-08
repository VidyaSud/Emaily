
const _ = require('lodash');
//const Path = require('path-parser');
//const Path = require('path-parser').default;
const { Path } = require('path-parser');
const { URL } =require('url');
const requireLogin= require('../middlewares/requireLogin');
const requireCredits= require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const SurveyTemplate = require('../services/emailTemplates/SurveyTemplate')

const mongoose =require('mongoose');
const Survey=mongoose.model('surveys'); //  we can directly require survey model like require('../models/Survey), 
//but test script will fail, so using above 2 line code approch.

module.exports = app =>{

    app.get('/api/surveys', requireLogin ,async (req,res) => {
        const surveys = await Survey.find({_user:req.user.id})
        .select({recipients :false}) ;
        res.send(surveys);
    });

    app.post ('/api/surveys/webhooks', (req,res) => {

        const SendGridData = [{ email:'vidya.lokesh.j@gmail.com',
         url:'http://localhost:3000/api/surveys/5ed71b9ad75b6a27af632336/yes',
         event:'Click'}];

        //  const events = _.map(SendGridData,  ({email,url}) => { 
        //    // const dd= SendGridData.map( event => { 
        //  const pathname = new URL (url).pathname;
        //  const parserPattrn = new Path ('/api/surveys/:surveyId/:choice');
        //  const match = parserPattrn.test(pathname);
        //    if(match){
        //        return { email,surveyId:match.surveyId, choice:match.choice}; //email:email has been condensed down as email
        //    }
        //  });        
        //  const compactEvents= _.compact(events)// removes the udefined elements from the array
        //  const uniqueEvents= _.uniqBy(compactEvents, 'email','surveyId') // remove the duplicate based on email& surveyId, it's a lodash method
        //  console.log(uniqueEvents);

        //// the above commented code can be wrriten like below by removing 'pathname' and applying 'chain' method from lodash.
        // https://lodash.com/docs/4.17.15#chain
       const parserPattrn = new Path ('/api/surveys/:surveyId/:choice');

        _.chain(SendGridData)
        .map( ({email,url}) => { 
        const match = parserPattrn.test(new URL (url).pathname);
            if(match){
            return { email,surveyId:match.surveyId, choice:match.choice}; //email:email has been condensed down as email
            }
        })       
        .compact()// removes the udefined elements from the array
        .uniqBy('email','surveyId') // remove the duplicate based on email& surveyId, it's a lodash method
        .each( ({surveyId,email,choice}) =>{  // iterate through each element to update in mongo DB
        Survey.updateOne(
            {
                _id:surveyId,
                recipients:{
                    $elemMatch:{ email:email,responded:false}
                }
            },
            {
                $inc:{[choice]:1},
                $set:{'recipients.$.responded':true},
                lastResponded: new Date()
            }
        ).exec(); // in order to execute the mongo queries  
        })
        .value(); // to get the value after chaining 
        // res.send({});
    });

    app.get('/api/surveys/:surveyId/:choice', (req,res) =>{
        res.send('Thanks for voting!')
    });
    app.post('/api/surveys', requireLogin, requireCredits, async (req,res) =>{
     //add requireCredits next to requireLogin in above line.
//console.log("here you r in", req.user.credits)
     const {title, subject,body, recipients}= req.body ;
        // const title= req.body.title;
        // const subject= req.body.subject;
        // const body= req.body.body;
        // const recipients= req.body.recipients;
    
    const survey= new Survey ( {
        title,
        subject,
        body,
        recipients: recipients.split(',').map( email => ({email:email.trim()})),
        _user:req.user.id,
        dateSent:Date.now()
    });    
    // the below code has been condensed down like above based on ES6
    // const survey= new Survey ({
    //     title:title,
    //     body:body,
    //     subject:subject
    // });

    //Great place to send Survey 
    const mailer =  new Mailer(survey,SurveyTemplate(survey));  
    try { 
        await mailer.send();
        await survey.save();
        // req.user.credits -=1 ;
        // const user= await req.user.save();
        // res.send(user);
    }
    catch(error){
        res.status(422).send(error) ;
    }

    });
};