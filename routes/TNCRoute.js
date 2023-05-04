const express = require("express");
const { addTerm , getAllTerms , updateATerm , deleteATerm} = require("../controllers/TNCController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");


// Router-1 : adding an user using POST  "api/user" 
router.post("/",fetchall, addTerm)

// Router-2 : getting all user details using "/api/user/all"
router.get("/",fetchall, getAllTerms)

// Router 4 : Update an existing user using PUT "/api/user"
router.put("/:tncId",fetchall, updateATerm)

// Router 5 : delete an existing user using DELETE "/api/user"
router.delete("/:tncId",fetchall, deleteATerm)


module.exports = router;