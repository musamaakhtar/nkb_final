const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema({

  bookingDate: {
    type: Number,
    required: true
  },
  time: { type: Schema.Types.ObjectId, ref: 'timeSlot' },
  user: { type: Schema.Types.ObjectId, ref: 'user' },
  technician: { type: Schema.Types.ObjectId, ref: 'technician' },
  technicians: [{ type: Schema.Types.ObjectId, ref: 'technician' }],
  pics: {
    type: Array,
    default: []
  },
  service: { type: Schema.Types.ObjectId, ref: 'service' },
  city: { type: Schema.Types.ObjectId, ref: 'city' },
  pincode: { type: Schema.Types.ObjectId, ref: 'pincode' },
  quotes: [{ type: Schema.Types.ObjectId, ref: 'quote' }],
  selectedQuote: { type: Schema.Types.ObjectId, ref: 'quote' },
  rating: { type: Schema.Types.ObjectId, ref: 'rating' },
  review: { type: Schema.Types.ObjectId, ref: 'review' },
  status: {
    type: String,
    default: "In-Progress"  // Wating , Assigned , Started , Completed , Cancelled
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  otp: {
    type: String,
    default: ""
  },
  permanentAddress: {
    type: String,
    default: ""
  },
  temporaryAddress: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  additionalInfo: {
    type: String,
    default: ""
  },
  verifyId: {
    type: String,
    default: ""
  },
  pdf: {
    type: String,
    default: ""
  },
  platformCommission: {
    type: Number,
    default: 20
  },
  date: {
    type: Number,
    required: true
  }

});

const Booking = mongoose.model("booking", BookingSchema);
module.exports = Booking;