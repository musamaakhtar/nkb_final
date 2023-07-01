const express = require("express");
const { addService , getAllService , updateAService , deleteAService, getServiceByCityPincode} = require("../controllers/ServiceController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");
const {upload} = require("../utilities/multerSetup")

const serviceUpload = upload("services")
// Router-1 : adding an user using POST  "api/user" 
router.post("/",fetchall,serviceUpload.single("icon"), addService)

// Router-2 : getting all user details using "/api/user/all"
router.get("/",fetchall, getAllService)

// getting service by city and pincode
router.get("/city-pincode" , fetchall , getServiceByCityPincode);

// Router 4 : Update an existing user using PUT "/api/user"
router.put("/:serviceId",fetchall,serviceUpload.single("icon"), updateAService)

// Router 5 : delete an existing user using DELETE "/api/user"
router.delete("/:serviceId",fetchall, deleteAService)


module.exports = router;