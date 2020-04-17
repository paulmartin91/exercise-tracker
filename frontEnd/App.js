var express = require('express')
var app = express()
var cors = require('cors')
var port = 3001
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.json());
app.use(cors())
app.use(bodyParser.json());

process.env.MONGO_URI = "mongodb+srv://paulmartin91:tempPass2020!@cluster0pm-ialw3.mongodb.net/test?retryWrites=true&w=majority";
//process.env.MONGO_URI = 'mongodb://localhost:27017'

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client)=>{
    if (err){console.log(err)} else {console.log('mongo db connected')}
    return;
  });

//mongodb schemas
var usernameSchema = new mongoose.Schema({
    name: String,
    _id: Number
});

var exerciseLogSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    userId: Number,
    date: Date
});

var Usernames = mongoose.model("usernames", usernameSchema);
var ExerciseLog = mongoose.model("exerciseLog", exerciseLogSchema);

//Create New User request
app.get('/api/exercise/new-user:username', async (req, res, done) => {
    if (typeof req.params.username !== 'string') { 
        res.json({"error": true, "usernameValid": false}) 
    } else {
        req.username = await req.params.username
        done()
    }
}, async (req, res, done) => {
    //check if username already exists
    req.userNameCheck = await Usernames.findOne({name: req.username}, (err, instance) => {
        if (err) console.log(err)
        if (instance !== null) {
            console.log('invalid')
            res.json({"usernameExists": true})
        } else {
            console.log('valid')
            done()
        }
    })
//create new instance in database and send callback
}, async (req, res) => {
    const fulllist = await Usernames.find({}, async (err, fullList) => {
        if (err) console.log(err)
        fullList.length == 0 ? req.userId = 0 :  req.userId = parseInt(fullList[fullList.length-1]._id+1)//req.userId = parseInt(fullList[fullList.length-1]._id)+1
      })
    const Create_New = await Usernames.create({"name": req.username, "_id": req.userId}, (err, instance) => {
        if (err) console.log(err)
        res.json(instance)
    })
})

//get all users
app.get('/api/exercise/users', (req, res) => {
    //get and send list of all users
    Usernames.find({}, (err, list) => {
        if (err) console.log(err)
        res.json(list)
    })
})

//add exercise log
app.post('/api/exercise/add', async (req, res, done) => {

    await req.body.date == '' ? req.body.date = new Date() : null

    //check if all peramiters are valid
    let checkID = await !isNaN(parseInt(req.body._id))
    let checkDescription = await typeof req.body.description == 'string' && req.body.description.length > 0
    let checkDuration = await !isNaN(parseInt(req.body.duration)) && parseInt(req.body.duration) > 0
    let checkDate = await !isNaN(new Date(req.body.date))

    /*
    console.log(`check id = ${checkID}`)
    console.log(`check description = ${checkDescription}`)
    console.log(`check duration = ${checkDuration}`)
      */
    console.log(`check duration = ${checkDate}`)
    console.log(new Date(req.body.date))
  
   

    //anything is invalid, reject the request and give reasoning
    if (!checkID || !checkDescription || !checkDuration || !checkDate) {
        res.json({
            "error": true,
            "idIsValid": checkID,
            "descriptionIsValid": checkDescription,
            "durationIsValid": checkDuration,
            "dateIsValid": checkDate
        })
    } else {
        done()
    }

}, (req, res, done) => {

    console.log("all valid")

    //check if _id exists
    const checkID = Usernames.findOne({"_id": req.body._id}, (err, instance)=>{
        if (err) console.log(err)
        if (instance == null){
            res.json({
                "error": true,
                "reason": "ID doesn't exist"
            }) 
        } else { 
            req.userName = instance.name
            done() 
        }
    })

}, async (req, res) => {

    //create exercise log
    const Add_Exercise = await ExerciseLog.create(
        {
            "username": req.userName,
            "description": req.body.description,
            "duration": req.body.duration,
            "userId": req.body._id,
            "date": req.body.date
        }, (err, instance) => {
            if (err) console.log(err)
            res.json(instance)
        })
})

//get exercise log(s)
app.get('/api/exercise/log', async (req, res, done) => {

    //console.log(`url = ${req.url}`, `req.query.id = ${req.query.id}`,`req.query.from = ${req.query.from}`,`req.query.to = ${req.query.to}`,`req.query.limit = ${req.query.limit}`)
    if (
        req.query.from == undefined && 
        req.query.to == undefined && 
        req.query.limit == undefined
    ) {
        req.findAll = await true
        done()
    } else {
        req.findAll = await false

        //check all request peramiters are valid
        let checkID = await !isNaN(parseInt(req.query.id))
        let checkFrom = await !isNaN(new Date(req.query.from))
        let checkTo = await !isNaN(new Date(req.query.to))
        let checkLimit = await !isNaN(parseInt(req.query.limit))
        
        //send error message if not
        if (!checkID || !checkFrom || !checkTo || !checkLimit) {
            res.json({
                "error": true,
                "idIsValid": checkID,
                "fromIsValid": checkFrom,
                "toIsValid": checkTo,
                "limitIsValid": checkLimit
            })
        } else {
            done()
        }
    }

}, (req, res, done) => {

    //check if ID exists
    const checkID = Usernames.findOne({"_id": req.query.id}, (err, instance)=>{
        if (err) console.log(err)
        if (instance == null){
            res.json({
                "error": true,
                "reason": "ID doesn't exist"
            }) 
        } else { 
            req.userName = instance.name
            done() 
        }
    })

}, async (req, res) => {

    if (req.findAll) {
        ExerciseLog.find({userId: req.query.id}, (err, list) => {
            if (err) console.log(err)
            list.length == 0 ? res.json({"error": true, "reason": `no logs found for user id: ${req.query.id}`}) : res.json(list)
        })
    } else {

        //find and save results
        let Results = await ExerciseLog.find( {
            $and:[
                {userId: req.query.id},
                {date: {$gte: new Date(req.query.from)}},
                {date: {$lte: new Date(req.query.to)}}
            ]
        }, (err) => {
            if (err) console.log(err)
        }).limit(parseInt(req.query.limit))

        //send results
        Results.length == 0 ? res.json({"error": true, "reason": "No instances with this ID"}) : res.json(Results)
    }
})


app.listen(port, () =>{
    console.log(`listening on ${port}`)
})