const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()


const app = express()
app.use(cors())
app.use(express.json())
const port = 8080



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llav3.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("enoticeboard").collection("enotices");


  app.get('/products', (req, res) => {
    collection.find()
      .toArray((err, items) => {
        res.send(items);


      })
  })
  app.get('/products/:id',async (req, res) => {
    const id=req.params.id;
    const query={_id:ObjectId(id)};
    const product=await collection.findOne(query);
    res.send(product);
  })

  app.put('/products/update/:id',async(req,res)=>{
    console.log(req.body);
    const id=req.params.id;
    const {noticeNo,title,shortTitle,batchName,date,imageURL}=req.body;
    const filter={_id:ObjectId(id)};
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        noticeNo,title,shortTitle,batchName,date,imageURL
      },
    };
    const result = await collection.updateOne(filter, updateDoc, options);
    res.json(result);
  })
  app.post('/addProduct', (req, res) => {
    const newEvent = req.body;

    collection.insertOne(newEvent)
      .then(result => {

        res.send(result.insertedCount > 0);
      })
  })

  app.delete('/delete/:id', (req, res) => {
    collection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })

 

  app.get('/', (req, res) => {
    res.send('E noticeboard!')
  })
  console.log('database connected');

});



app.listen(process.env.PORT || port)