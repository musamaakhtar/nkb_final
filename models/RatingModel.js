const mongoose = require("mongoose");
const { Schema } = mongoose;

const RatingSchema = new Schema({

  rating: {
    type: Number,
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

const Rating = mongoose.model("rating", RatingSchema);
module.exports = Rating;