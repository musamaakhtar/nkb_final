const express = require("express");
const { addReview , getAllReview, getUserOrTechnicianSpecificReview, updateAReview, deleteAReview } = require("../controllers/ReviewController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");


// Router-1 : adding an user using POST  "api/user" 
router.post("/",fetchall, addReview)

// Router-2 : getting all user details using "/api/user/all"
router.get("/all",fetchall, getAllReview)

// Router-2 : getting user or technician specific review
router.get("/",fetchall, getUserOrTechnicianSpecificReview)

// Router 4 : Update an existing user using PUT "/api/user"
router.put("/:reviewId",fetchall, updateAReview)

// Router 5 : delete an existing user using DELETE "/api/user"
router.delete("/:reviewId",fetchall, deleteAReview)


module.exports = router;