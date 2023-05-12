const jwt = require('jsonwebtoken');
require('dotenv').config();
// const sendMail = require("../utilities/sendMail");
// const generateOTP = require("../utilities/otp");
const bcrypt = require('bcryptjs');
const SuperAdmin = require('../models/SuperAdminModel');
const Role = require('../models/RoleModel');


const add = async (req, res) => {
    let success = false;
    const { name, phone, email, role, password } = req.body
    try {
        const app = req.myapp;
        if (app !== "nkb") {
            return res.status(401).json({ success, message: "Token wrong" })
        }

        let superAdmin = await SuperAdmin.findOne({ phone })
        if (superAdmin) {
            return res.status(400).json({ success, message: "Super admin already exists" })
        }
        superAdmin = await SuperAdmin.findOne({ name })
        if (superAdmin) {
            return res.status(400).json({ success, message: "Super admin already exists" })
        }
        superAdmin = await SuperAdmin.findOne({ email })
        if (superAdmin) {
            return res.status(400).json({ success, message: "Super admin already exists" })
        }
        let newRole = await Role.findById(role);
        superAdmin = await SuperAdmin.findOne({ role })
        if (superAdmin && newRole.name.toString === "Admin") {
            return res.status(400).json({ success, message: "Can not create more than one super admin" })
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);
        superAdmin = await SuperAdmin.create({
            name: name,
            phone,
            email,
            role,
            password: secPass,
            date: new Date().getTime()
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

        let superAdminId = req.superAdmin;
        // checkig if the admin exists or not
        let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
        if (!superAdmin) {
            return res.status(401).json({ success, message: "You are not allowed to get admin details" })
        }
        if (superAdmin.role.name.toString() !== "Admin") {
            return res.status(400).json({ success, message: "You are not allowed to get admin details" })
        }

        superAdmin = await SuperAdmin.find().select(["-name", "-password", "-phone", "-email"]);
        success = true;
        return res.json({ success, message: superAdmin[0] });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateAdmin = async (req, res) => {
    let success = false;
    const { name, password, phone, email } = req.body;
    const { id } = req.params;
    try {

        let superAdminId = req.superAdmin;
        // checkig if the admin exists or not
        let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
        if (!superAdmin) {
            return res.status(401).json({ success, message: "You are not allowed to update admin details" })
        }
        if (superAdmin.role.name.toString() !== "Admin" && superAdminId.toString() !== id.toString()) {
            return res.status(400).json({ success, message: "You are not allowed to update admin details" })
        }

        //checking if any superadmin exists with this name , phone or email

        

        // creating the salt
        const salt = await bcrypt.genSalt(10);
        // create a new admin object
        const newAdmin = {};
        if (name) {
            let newSuperAdmin = await SuperAdmin.findOne({ name })
            if (newSuperAdmin && newSuperAdmin._id.toString() !== id.toString) {
                return res.status(400).json({ success, message: "This name already taken" })
            }
            newAdmin.name = name
        };
        if (password) {
            const secPass = await bcrypt.hash(password, salt);
            newAdmin.password = secPass;
        };
        if (email) {
            let newSuperAdmin = await SuperAdmin.findOne({ email })
            if (newSuperAdmin && newSuperAdmin._id.toString() !== id.toString) {
                return res.status(400).json({ success, message: "This email already taken" })
            }
            newAdmin.email = email;
        }
        if(phone){
            let newSuperAdmin = await SuperAdmin.findOne({ phone })
            if (newSuperAdmin && newSuperAdmin._id.toString() !== id.toString) {
                return res.status(400).json({ success, message: "This number already taken" })
            }
            newAdmin.phone = phone;
        }


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
        if (app !== "nkb") {
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
        const authSuperAdmin = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "7d" })

        success = true;
        return res.json({ success, authSuperAdmin });



    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }

}




module.exports = { add, getAdmin, updateAdmin, login }  