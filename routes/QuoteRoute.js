const express = require("express");
const { addQuote , getAllQuote, getAllQuoteOfATechnician, approveAQuoteByAdmin, getAllQuoteOfABooking } = require("../controllers/QuoteController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");


// Router-1 : adding a quote using POST  "api/user" 
router.post("/",fetchall, addQuote)

// Router-2 : getting all quote details using "/api/user/all"
router.get("/all",fetchall, getAllQuote)

// Router-2 : getting all quote details for a partcular technician using "/api/user/all"
router.get("/",fetchall, getAllQuoteOfATechnician)

// Router-2 : getting all quote details for a partcular booking
router.get("/:bookingId",fetchall, getAllQuoteOfABooking)

// // Router-2 : approve a quote by admin
// router.put("/approve",fetchall, approveAQuoteByAdmin)



module.exports = router;