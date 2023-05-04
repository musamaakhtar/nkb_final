const mongoose = require("mongoose");
const { Schema } = mongoose;

const TNCSchema = new Schema({

  details: {
    type: String,
    required:true
  },  
  date:{
    type:Number,
    required:true
  }

});

const TNC = mongoose.model("tnc", TNCSchema);
module.exports = TNC;