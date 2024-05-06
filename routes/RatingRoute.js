const express = require("express");
const { addRating , getAllRating, getUserOrTechnicianSpecificRating, updateARating, deleteARating } = require("../controllers/RatingController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");


// Router-1 : adding an user using POST  "api/user" 
router.post("/",fetchall, addRating)

// Router-2 : getting all user details using "/api/user/all"
router.get("/all",fetchall, getAllRating)

// Router-2 : getting user or technician specific review
router.get("/",fetchall, getUserOrTechnicianSpecificRating)

// Router 4 : Update an existing user using PUT "/api/user"
router.put("/:ratingId",fetchall, updateARating)

// Router 5 : delete an existing user using DELETE "/api/user"
router.delete("/:ratingId",fetchall, deleteARating)


module.exports = router;