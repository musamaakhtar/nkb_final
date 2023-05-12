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
  city:{ type: Schema.Types.ObjectId, ref: 'city' },
  pincode:{ type: Schema.Types.ObjectId, ref: 'pincode' },  

  date:{
    type:Number,
    required:true
  }

});

const Service = mongoose.model("service", ServiceSchema);
module.exports = Service;