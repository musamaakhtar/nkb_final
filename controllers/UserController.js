const jwt = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');
const User = require('../models/UserModel');
const City = require('../models/CityModel');
const Pincode = require('../models/PincodeModel');
const Rating = require('../models/RatingModel');
const Review = require('../models/ReviewModel');
const SuperAdmin = require('../models/SuperAdminModel');
const Technician = require('../models/TechnicianModel');


const sendOTPToUser = async (req, res) => {
    let success = false;
    const { phone } = req.body;
    try {
        const app = req.myapp;
        if (app!=="nkb") {
            return res.status(401).json({ success, message: "Token wrong" })
        }
        // check if the user exists or not
        let user = await User.findOne({ phone });

        if (!user) {
            // check if any technician used this number or not
            let technician = await Technician.findOne({phone});
            if(technician){
                return res.status(400).json({success , message:"Sorry this number already used"})
            }


            user = await User.create({
                phone,
                date:new Date().getTime()
            })
        };

        let {data} = await axios.get(`https://2factor.in/API/V1/f1611593-0712-11eb-9fa5-0200cd936042/SMS/+91${phone}/AUTOGEN2/OTP1`);
        // update the otp of the user
        await User.findOneAndUpdate({ phone } , {$set:{otp:data.OTP}} , {new:true});



        success = true;
        return res.json({ success, message:"otp sent successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }

}

const loginUser = async (req, res) => {
    let success = false;
    const { phone , otp } = req.body;
    try {
        const app = req.myapp;
        if (app!=="nkb") {
            return res.status(401).json({ success, message: "Token wrong" })
        }
        // check if the user exists or not
        let user = await User.findOne({ phone });
        if(user.otp !== parseInt(otp)){
            return res.status(400).json({success , message:"Please enter correct otp"})
        }

        // creating jwt token
        const data = { user: user._id };
        const authUser = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "7d" })

        success = true;
        return res.json({ success, authUser, id: user._id.toString() });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }

}

const getUser = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let superAdminId , superAdmin;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("user") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"User not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        const pattern = `${query}`
        
        let users = await User.find({ phone: { $regex: pattern } }).populate(["city" , "pincode"]);
        if (superAdmin.role.name !== "Admin") {
            users = users.filter(user=>user.city!==null)
            users = users.filter(user => superAdmin.cities.includes(user.city._id.toString()))
        }
        const noOfUsers = users.length;
        users = users.slice(page * size, (page + 1) * size);
        success = true;
        return res.json({ success, message: { users, noOfUsers } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getUserById = async (req, res) => {
    let success = false;



    try {
        let id = req.user;
        // checkig if the interest exists or not
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success, message: "Not found" })
        }

        success = true;
        return res.json({ success, message: user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getUserByIdInAdmin = async (req, res) => {
    let success = false;
    const { id } = req.params;


    try {
        let superAdminId;
        // console.log(req.superAdmin)
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("user") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"User not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // checkig if the interest exists or not
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success, message: "Not found" })
        }

        success = true;
        return res.json({ success, message: user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateUser = async (req, res) => {
    let success = false;
    const { name, city, pincode } = req.body;

const {userId} = req.params;
    try {
        let id , superAdminId;
        if(req.superAdmin){
            superAdminId = req.superAdmin
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("user") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"User not allowed"}) 
             }
        }
        else if(req.user){
            id = req.user;
            if(id.toString()!==userId.toString()){
                return res.status(400).json({success , message:"You can not update other user details"})
            }
        }
        else{
            return res.status(401).json({success , message:"No valid token found"})
        }
        // checkig if the interest exists or not
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success, message: "Not found" })
        }

        // creating a new user object
        let newUser = {};
        if (name) { newUser.name = name };
        if (req.file) {
            newUser.profilePic = `${process.env.HOST}/static/images/users/${req.file.filename}`
        }
        if (city) {
            // checking if the city exists or not
            let newCity = await City.findById(city);
            if (newCity) {
                newUser.city = city
            }
        };
        if (pincode) {
            // checking if the pincode exists or not
            let newPincode = await Pincode.findById(pincode);
            if (newPincode) {
                newUser.pincode = pincode
            }
        }

        user = await User.findByIdAndUpdate(userId, { $set: newUser }, { new: true });
        
        success = true;
        return res.json({ success, message: user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteUser = async (req, res) => {
    let success = false;

    const {userId} = req.params;
    try {
        let id , superAdminId;
        if(req.superAdmin){
            superAdminId = req.superAdmin
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("user") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"User not allowed"}) 
             }
        }
        else if(req.user){
            id = req.user;
            if(id.toString()!==userId.toString()){
                return res.status(400).json({success , message:"You can not update other user details"})
            }
        }
        else{
            return res.status(401).json({success , message:"No valid token found"})
        }
        // checking if the user exists or not
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success, message: "Not found" })
        }

        user = await User.findByIdAndDelete(userId);
        success = true;
        return res.json({ success, message: user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { loginUser, getUser, getUserById, getUserByIdInAdmin, updateUser, deleteUser , sendOTPToUser } 