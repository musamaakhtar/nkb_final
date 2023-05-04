const mongoose = require("mongoose");
const { Schema } = mongoose;

const CitySchema = new Schema({

  name: {
    type: String,
    required:true
  },  
  date:{
    type:Number,
    required:true
  }

});

const City = mongoose.model("city", CitySchema);
module.exports = City;