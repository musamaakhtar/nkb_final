// const mongoose = require("mongoose");
const { MongoClient } = require('mongodb');


require('dotenv').config();
const  mongoURI = "mongodb+srv://bhattacharjeesolution:bhattacharjeesolution@cluster0.otfdv7w.mongodb.net/nkb";
// const  mongoURI = "mongodb://localhost:27017/nkb";

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
// let dbClient = null;

async function connectToMongoDB() {
   try {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
        // dbClient = client;
        // Handle any required database initialization or setup here
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
    //  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    //  await client.connect()
    //     .then(client => {
    //         console.log('Connected to MongoDB');
    // // MongoClient.connect(mongoURI, connectOptions)
    //         // dbClient = client;
    //         // Handle any required database initialization or setup here
    //     })
    //     .catch(err => {
    //         console.error('Error connecting to MongoDB:', err.message);
    //     });
}

// Function to periodically reconnect
// function startReconnectInterval() {
//     setInterval(() => {
//         if (!dbClient || !dbClient.isConnected()) {
//             console.log('Attempting to reconnect to MongoDB...');
//             connectToMongoDB();
//         }
//     }, 5000); // Reconnect every 5 seconds (adjust as needed)
// }


// mongoose.set("strictQuery", false);

// const connectToMongo = async ()=>{
//     try {
//         await mongoose.connect(process.env.mongoURI || mongoURI);
//         console.log("connected to mongo successfully")
//     } catch (error) {
//         console.log(error);
//     }
// }
// startReconnectInterval();
module.exports= connectToMongoDB ;
