const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuoteSchema = new Schema({

    booking: { type: Schema.Types.ObjectId, ref: 'booking' },
    technician: { type: Schema.Types.ObjectId, ref: 'technician' },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default:"Pending"  //"Approved" , "Rejected"
    },
    date: {
        type: Number,
        required:true
    }

});

const Quote = mongoose.model("quote", QuoteSchema);
module.exports = Quote;