const express = require("express");
const { loginUser,getUser , getUserById,getUserByIdInAdmin, updateUser, deleteUser, sendOTPToUser} = require("../controllers/UserController");
const router = express.Router();
const fetchall = require("../middlewares/fetchall");
const {upload} = require("../utilities/multerSetup")

const userUpload = upload("users")

router.post("/send-otp",fetchall, sendOTPToUser)
// Router-1 : adding an user using POST  "api/user" 
router.post("/login",fetchall, loginUser)

// Router-2 : getting all user details using "/api/user/all"
router.get("/all",fetchall, getUser)

// Router 3 : getting a specific user details using "/api/user"
router.get("/:id",fetchall, getUserByIdInAdmin)

// Router 3 : getting a specific user details using "/api/user"
router.get("/",fetchall, getUserById)

// Router 4 : Update an existing user using PUT "/api/user"
router.put("/:userId",fetchall, userUpload.single("image"), updateUser)

// Router 5 : delete an existing user using DELETE "/api/user"
router.delete("/:userId",fetchall, deleteUser)


module.exports = router;