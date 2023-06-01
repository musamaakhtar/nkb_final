const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({

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
    default: ""
  },
  city:{ type: Schema.Types.ObjectId, ref: 'city' }, 
  pincode:{ type: Schema.Types.ObjectId, ref: 'pincode' }, 
  ratings:[{ type: Schema.Types.ObjectId, ref: 'rating' }],
  reviews:[{ type: Schema.Types.ObjectId, ref: 'review' }],
  otp:{
    type:Number,
    default:0
  },
  date:{
    type:Number,
    required:true
  }

});

const User = mongoose.model("user", UserSchema);
module.exports = User;