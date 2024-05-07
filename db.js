const mongoose = require("mongoose");


require('dotenv').config();
const  mongoURI = "mongodb+srv://bhattacharjeesolution:bhattacharjeesolution@cluster0.otfdv7w.mongodb.net/nkb";
// const  mongoURI = "mongodb://localhost:27017/nkb";



mongoose.set("strictQuery", false);

const connectToMongo = async ()=>{
    try {
        await mongoose.connect(process.env.mongoURI || mongoURI);
        console.log("connected to mongo successfully")
    } catch (error) {
        console.log(error);
    }
}

module.exports= connectToMongo ;