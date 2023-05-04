const express = require("express");
const { addPincode , getAllPincode , getPincodeByCity, updateAPincode , deleteAPincode} = require("../controllers/PincodeController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");

// Router-1 : adding an pincode using POST  "api/pincode" 
router.post("/",fetchall, addPincode)

// Router-2 : getting all pincode details using "/api/pincode"
router.get("/",fetchall, getAllPincode)

// Router-3 : getting city wise pincode details using "/api/pincode/:cityId"
router.get("/:cityId",fetchall, getPincodeByCity)

// Router 4 : Update an existing pincode using PUT "/api/pincode"
router.put("/:pincodeId",fetchall, updateAPincode)

// Router 5 : delete an existing pincode using DELETE "/api/pincode"
router.delete("/:pincodeId",fetchall, deleteAPincode)

module.exports = router;