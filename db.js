const mongoose = require("mongoose");

const { MongoClient } = require('mongodb');

require('dotenv').config();
const  mongoURI = process.env.mongoURI || "mongodb+srv://bhattacharjeesolution:bhattacharjeesolution@cluster0.otfdv7w.mongodb.net/nkb";
// const  mongoURI = "mongodb://localhost:27017/nkb";

const client = new MongoClient(mongoURI);


mongoose.set("strictQuery", false);

const connectToMongo = async ()=>{
    try {
        await client.connect(process.env.mongoURI || mongoURI);
        console.log("connected to mongo successfully")
    } catch (error) {
        console.log(error);
    }
}

module.exports= connectToMongo ;