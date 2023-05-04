const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({

  review: {
    type: String,
    required:true,
  }, 
  user:{ type: Schema.Types.ObjectId, ref: 'user' },
  booking:{ type: Schema.Types.ObjectId, ref: 'booking' },
  technician:{ type: Schema.Types.ObjectId, ref: 'technician' },
  date:{
    type:Number,
    required:true
  }

});

const Review = mongoose.model("review", ReviewSchema);
module.exports = Review;