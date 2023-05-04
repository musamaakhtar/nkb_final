const jwt = require('jsonwebtoken');
require('dotenv').config();
// const sendMail = require("../utilities/sendMail");
// const generateOTP = require("../utilities/otp");
const bcrypt = require('bcryptjs');
const SuperAdmin = require('../models/SuperAdminModel');


const add = async (req, res) => {
    let success = false;
    const { name, password } = req.body
    try {
        const app = req.myapp;
        if (app!=="nkb") {
            return res.status(401).json({ success, message: "Token wrong" })
        }
        


        let superAdmin = await SuperAdmin.find();
        if (superAdmin.length > 0) {
            return res.status(400).json({ success, message: "You can not add more than 1 super admin" })
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);
        superAdmin = await SuperAdmin.create({
            name: name,
            password: secPass,
            date:new Date().getTime()
        })

        success = true;
        return res.json({ success, message: superAdmin });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getAdmin = async (req, res) => {
    let success = false;
    try {

        const app = req.myapp;
        if (app!=="nkb") {
            return res.status(401).json({ success, message: "Token wrong" })
        }


        let superAdmin = await SuperAdmin.find().select(["-username", "-password"]);
        success = true;
        return res.json({ success, message: superAdmin[0] });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateAdmin = async (req, res) => {
    let success = false;
    const { name, password } = req.body;

    try {

        let superAdminId = req.superAdmin;
        // checkig if the admin exists or not
        let superAdmin = await SuperAdmin.findById(superAdminId);
        if (!superAdmin) {
            return res.status(401).json({ success, message: "You are not allowed to update admin details" })
        }

        // creating the salt
        const salt = await bcrypt.genSalt(10);
        // create a new admin object
        const newAdmin = {};
        if (name) { newAdmin.name = name };
        if (password) {
            const secPass = await bcrypt.hash(password, salt);
            newAdmin.password = secPass;
        };





        superAdmin = await SuperAdmin.findByIdAndUpdate(superAdminId, { $set: newAdmin }, { new: true });
        success = true;
        return res.json({ success, message: superAdmin });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const login = async (req, res) => {
    let success = false;
    const { name, password } = req.body;
    try {
        const app = req.myapp;
        if (app!=="nkb") {
            return res.status(401).json({ success, message: "Token wrong" })
        }

        // check if the admin exists or not
        let superAdmin = await SuperAdmin.findOne({ name });
        if (!superAdmin) { return res.status(404).json({ success, message: "Not Found" }) };

        // comparing the given password with the saved password in database
        const passwordCompare = await bcrypt.compare(password, superAdmin.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, message: "Please try to login with correct credentials" });
        }
        

        // creating jwt token
        const data = { superAdmin: superAdmin._id };
        const authSuperAdmin = jwt.sign(data, process.env.JWT_SECRET, {expiresIn: "7d"})

        success = true;
        return res.json({ success, authSuperAdmin });



    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }

}




module.exports = { add, getAdmin, updateAdmin, login }  