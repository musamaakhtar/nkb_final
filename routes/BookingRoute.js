const express = require("express");
const { addBooking , getAllBooking , updateABooking , deleteABooking, getUserSpecificBooking, getABookingDetails, generateReport, sendOtp, getUserSpecificInvoice, addMoreImages, deleteAnImage, getAllInvoice} = require("../controllers/BookingController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");
const {upload} = require("../utilities/multerSetup")

const bookingUpload = upload("bookings")
const imageUpload = bookingUpload.fields([{ name: 'images', maxCount: 10 }])


// Router-1 : adding an user using POST  "api/user" 
router.post("/",fetchall,imageUpload, addBooking)

// Router-2 : getting all user details using "/api/user/all"
router.get("/all",fetchall, getAllBooking)

// Router-3 : getting booking of a specific user
router.get("/",fetchall, getUserSpecificBooking)

// get user specific invoice
router.get("/invoices" , fetchall , getUserSpecificInvoice);

// get all invoice
router.get("/all-invoices" , fetchall , getAllInvoice);

// Router-3 : getting booking of a specific user
router.get("/generate-report/:bookingId", generateReport)


// Router-3 : getting details of a booking
router.get("/:bookingId",fetchall, getABookingDetails)
// send otp
router.put("/send-otp",fetchall, sendOtp)

// Router 4 : Update an existing user using PUT "/api/user"
router.put("/:bookingId",fetchall, updateABooking)

// adding extra images in booking
router.put("/images/:bookingId" ,fetchall,imageUpload,addMoreImages )

// delete an image in booking
router.delete("/images/:bookingId" ,fetchall,imageUpload,deleteAnImage )


// Router 5 : delete an existing user using DELETE "/api/user"
router.delete("/:bookingId",fetchall, deleteABooking)


module.exports = router;