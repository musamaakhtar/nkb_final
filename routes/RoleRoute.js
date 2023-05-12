const express = require("express");
const { addRole , getAllRole , updateARole , deleteARole} = require("../controllers/RoleController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");


// Router-1 : adding an role using POST  "api/role" 
router.post("/",fetchall, addRole)

// Router-2 : getting all role details using "/api/role/all"
router.get("/",fetchall, getAllRole)

// Router 4 : Update an existing role using PUT "/api/role"
router.put("/:roleId",fetchall, updateARole)

// Router 5 : delete an existing role using DELETE "/api/role"
router.delete("/:roleId",fetchall, deleteARole)


module.exports = router;