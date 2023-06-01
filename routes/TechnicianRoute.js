const express = require("express");
const { loginTechnician,addTechnician,getTechnician , getTechnicianById,getTechnicianByIdInAdmin, updateTechnician, deleteTechnician, getBookingsByTechnician, approveATechnician, getQuotedBookingsByTechnician, sendOTPToTechnician} = require("../controllers/TechnicianController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");
const {upload} = require("../utilities/multerSetup")

const technicianUpload = upload("technicians")

// Router-1 : login an technician using POST  "api/technician/login" 
router.post("/login",fetchall, loginTechnician)

// Router-1 : adding an technician using POST  "api/technician" 
router.post("/",fetchall, addTechnician)

router.post("/send-otp",fetchall, sendOTPToTechnician)

// Router-2 : getting all technician details using "/api/technician/all"
router.get("/all",fetchall, getTechnician)

// Router-2 : getting all bookings for this technician
router.get("/bookings",fetchall, getBookingsByTechnician)

// Router-2 : getting active quoted bookings for this technician
router.get("/quotes",fetchall, getQuotedBookingsByTechnician)

// Router 3 : getting a specific technician details using "/api/technician"
router.get("/:id",fetchall, getTechnicianByIdInAdmin)

// Router 3 : getting a specific technician details using "/api/technician"
router.get("/",fetchall, getTechnicianById)

// Router 4 : approve an existing technician using PUT "/api/technician"
router.put("/approve",fetchall, approveATechnician)

// Router 4 : Update an existing technician using PUT "/api/technician"
router.put("/:technicianId",fetchall, technicianUpload.single("image"), updateTechnician)

// Router 5 : delete an existing technician using DELETE "/api/technician"
router.delete("/:technicianId",fetchall, deleteTechnician)


module.exports = router;