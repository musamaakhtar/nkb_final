const mongoose = require("mongoose");
const { Schema } = mongoose;

const PincodeSchema = new Schema({

  code: {
    type: String,
    required:true
  }, 
  
  city:{ type: Schema.Types.ObjectId, ref: 'city' },

  date:{
    type:Number,
    required:true
  }

});

const Pincode = mongoose.model("pincode", PincodeSchema);
module.exports = Pincode;