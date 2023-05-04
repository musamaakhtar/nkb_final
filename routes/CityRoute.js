const express = require("express");
const { addCity , getAllCity , updateACity , deleteACity} = require("../controllers/CityController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");


// Router-1 : adding an user using POST  "api/user" 
router.post("/",fetchall, addCity)

// Router-2 : getting all user details using "/api/user/all"
router.get("/",fetchall, getAllCity)

// Router 4 : Update an existing user using PUT "/api/user"
router.put("/:cityId",fetchall, updateACity)

// Router 5 : delete an existing user using DELETE "/api/user"
router.delete("/:cityId",fetchall, deleteACity)


module.exports = router;