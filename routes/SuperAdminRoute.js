const express = require("express");
const { getAdmin, add, updateAdmin, login, deleteAdmin, getASingleAdmin } = require("../controllers/SuperAdminController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");

// Router-1 adding a admin using POST  "api/super-admin" 
router.post("/", fetchall, add)


// getting all admin details using "/api/super-admin"
router.get("/", fetchall, getAdmin)

// getting single admin details using "/api/super-admin"
router.get("/single", fetchall, getASingleAdmin)


// Router 3 : Update an existing admin using PUT "/api/super-admin"
router.put("/:id", fetchall, updateAdmin)

// Router 3 : delete an existing admin using PUT "/api/super-admin"
router.delete("/:id", fetchall, deleteAdmin)


// admin login  "/api/super-admin/login"
router.post("/login", fetchall, login)



module.exports = router;