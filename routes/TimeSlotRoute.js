const express = require("express");
const { addTimeSlot , getAllTimeSlot , updateATimeSlot , deleteATimeSlot} = require("../controllers/TimeSlotController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");


// Router-1 : adding an user using POST  "api/user" 
router.post("/",fetchall, addTimeSlot)

// Router-2 : getting all user details using "/api/user/all"
router.get("/",fetchall, getAllTimeSlot)

// Router 4 : Update an existing user using PUT "/api/user"
router.put("/:timeSlotId",fetchall, updateATimeSlot)

// Router 5 : delete an existing user using DELETE "/api/user"
router.delete("/:timeSlotId",fetchall, deleteATimeSlot)


module.exports = router;