const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require("mongodb").ObjectID;

require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cpqmt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(express.json());
app.use(cors());

const port = 4000;  

app.get('/', (req, res) => {
    res.send("Hello from Database and its working!")
})
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log("Connection Error", err);

   

    
    const courseCollection = client.db("FaerEdu").collection("courses");

    app.get("/courses", (req, res) =>{
        courseCollection.find()
        .toArray((err, items) =>{
            res.send(items)
        })
    })

    app.post("/addCourse", (req, res)=>{
        const newCourse = req.body;
        console.log("adding new course", newCourse);
        courseCollection.insertOne(newCourse)
        .then((result)=>{
            console.log("inserted Count", result.insertedCount);
            res.send(result.insertedCount > 0);
        });

    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        courseCollection.find({email: email})
        .toArray((err, admins) => {
            res.send(admins.length > 0);
        })

    })


    app.delete("/delete/:id", (req, res) =>{
        const id = ObjectID(req.params.id);
        console.log("Deleted", id)
        courseCollection
        .findOneAndDelete({_id: id})
        .then((document) => res.send(document.deleteCount > 0) )
    })



    const courseCartCollection = client.db("FaerEdu").collection("coruseCart");

    app.post("/addCourseCart", (req, res) =>{
        const course = req.body;
        console.log(course)
        courseCartCollection.insertOne(course)
        .then(result =>{
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/enrolledCourse', (req, res) =>{
       
        courseCartCollection.find({email: req.query.email})
        .toArray( (err, documents) =>{
          res.send(documents);
        })
      })
      app.delete("/deleteEnrolledCourse/:id", (req, res) =>{
        const id = ObjectID(req.params.id);
        console.log("Enrolled Course Deleted", id)
        courseCartCollection
        .findOneAndDelete({_id: id})
        .then((item) => res.send(item.deleteCount > 0) )
    })


    app.get('/courseEnrolledByUser', (req, res) =>{
      
        courseCartCollection.find({})
        .toArray( (err, items) =>{
          res.send(items);
        })
      })

      app.post('/update/:id', (req, res)=>{
        const id = ObjectID(req.params.id)
        const data = req.body;
        courseCartCollection.findOneAndUpdate({_id:id}, {$set :{status:data.status}})
        .then(result => {
            console.log(result)
            res.send(result);
        })
        .catch(err => {
            console.log(err)
        })
    })

 
    const reviewCollection = client.db("FaerEdu").collection("reviewCollection");
    
    app.post("/addReview", (req, res) =>{
        const review = req.body;
        console.log(review)
        reviewCollection.insertOne(review)
        .then(result =>{
            res.send(result.insertedCount > 0)
        })
    })
    app.get("/reviews", (req, res)=>{
        reviewCollection.find({})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    })



    
});

console.log('Server Running at', {port});
app.listen(process.env.PORT || port)