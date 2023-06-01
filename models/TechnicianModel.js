const mongoose = require("mongoose");
const { Schema } = mongoose;

const TechnicianSchema = new Schema({

  name: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    required:true,
    unique:true
  },
  profilePic: {
    type: String,
    default:""
  }, 
  city:{ type: Schema.Types.ObjectId, ref: 'city' },
  category:{ type: Schema.Types.ObjectId, ref: 'service' },
  pincode:{ type: Schema.Types.ObjectId, ref: 'pincode' },
  rating:{
    type:Number,
    default:0
  },
  ratings:[{ type: Schema.Types.ObjectId, ref: 'rating' }],
  reviews:[{ type: Schema.Types.ObjectId, ref: 'review' }],
  isApproved:{
    type:Boolean,
    default:false
  },
  otp:{
    type:Number,
    default:0
  },
  date:{
    type:Number,
    required:true
  }

});

const Technician = mongoose.model("technician", TechnicianSchema);
module.exports = Technician;