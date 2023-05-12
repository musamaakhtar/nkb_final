const mongoose = require("mongoose");
const { Schema } = mongoose;

const TimeSlotSchema = new Schema({

  time: {
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

const TimeSlot = mongoose.model("timeSlot", TimeSlotSchema);
module.exports = TimeSlot;