const mongoose = require("mongoose");
const { Schema } = mongoose;

const ServiceSchema = new Schema({

  name: {
    type: String,
    required:true
  },
  icon: {
    type: String,
    required:true
  },  

  date:{
    type:Number,
    required:true
  }

});

const Service = mongoose.model("service", ServiceSchema);
module.exports = Service;