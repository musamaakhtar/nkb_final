const jwt = require('jsonwebtoken');
require('dotenv').config();
const City = require('../models/CityModel');
const Pincode = require('../models/PincodeModel');
const SuperAdmin = require('../models/SuperAdminModel');
const User = require('../models/UserModel');
const Technician = require('../models/TechnicianModel');

const addPincode = async (req, res) => {
    let success = false;
    const { code , city } = req.body;
    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("pincode") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"Pincode not allowed"}) 
         }
        // check if the pincode exists or not
        let pincode = await Pincode.findOne({ code });
        if (pincode) {
            return res.status(400).json({ success, message: "There is already one pincode with this code" })
        }

        // check if the city exists or not
        let newCity = await City.findById(city);
        if(!newCity){
            return res.status(404).json({success , message:"No city found"})
        }
        pincode = await Pincode.create({
            code,
            city,
            date:new Date().getTime()
        })
        success = true;
        return res.json({ success, message:pincode });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllPincode = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let userId, technicianId , superAdminId;
        if (req.user) {
            userId = req.user;
            //check if the user exists or not
            let user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success, message: "User not found" })
            }
        }
        else if (req.technician) {
            technicianId = req.technician;
            //check if the user exists or not
            let technician = await Technician.findById(technicianId);
            if (!technician) {
                return res.status(404).json({ success, message: "Technician not found" })
            }
        }
        else if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("pincode") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Pincode not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        const pattern = `${query}`
        let noOfPincodes = (await Pincode.find({ code: { $regex: pattern } })).length
        let pincodes = await Pincode.find({ code: { $regex: pattern } }).populate("city", "name").limit(size).skip(size * page);
        if(req.superAdmin){
            let superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("pincode") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Pincode not allowed"}) 
             }
             
             pincodes = await Pincode.find({ code: { $regex: pattern } }).populate("city", "name");
             console.log(pincodes)
             if (superAdmin.role.name !== "Admin"){
                pincodes = pincodes.filter(pincode=>pincode.city!==null)
             pincodes = pincodes.filter(pincode=>superAdmin.cities.includes(pincode.city._id.toString()))
             console.log(superAdmin.cities)
            }
             noOfPincodes = pincodes.length;
             pincodes = pincodes.slice(page * size, (page + 1) * size);

        }
        success = true;
        return res.json({ success, message: { pincodes, noOfPincodes } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getPincodeByCity = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    const {cityId} = req.params;
    try {
        let userId, technicianId , superAdminId , appId;
        if (req.user) {
            userId = req.user;
            //check if the user exists or not
            let user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success, message: "User not found" })
            }
        }
        else if (req.technician) {
            technicianId = req.technician;
            //check if the user exists or not
            let technician = await Technician.findById(technicianId);
            if (!technician) {
                return res.status(404).json({ success, message: "Technician not found" })
            }
        }
        else if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate("role");
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("pincode") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Pincode not allowed"}) 
             }
        }
        else if (req.myapp) {
            appId = req.myapp;
            if (appId !== "nkb") {
                return res.status(401).json({ success, message: "Token wrong" })
            }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        const pattern = `${query}`
        const noOfPincodes = (await Pincode.find({$and:[{ code: { $regex: pattern } },{ city: cityId }]})).length
        const pincodes = await Pincode.find({$and:[{ code: { $regex: pattern } },{ city: cityId }]}).limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { pincodes, noOfPincodes } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateAPincode = async (req, res) => {
    let success = false;
    const { code , city } = req.body;
    const {pincodeId} = req.params;

    try { 
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate("role");
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("pincode") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"pincode not allowed"}) 
         }
        
        // check if the city exists or not
        let newCity = await City.findById(city);
        if(!newCity){
            return res.status(404).json({success , message:"No city found"})
        }
        // checking if the pincode exists or not
        let pincode = await Pincode.findById(pincodeId);
        if (!pincode) {
            return res.status(404).json({ success, message: "Not found" })
        }

        // checking if there is an pincode with this code or not
        pincode = await Pincode.findOne({code});
        if (pincode && pincode._id.toString()!==pincodeId.toString()) {
            return res.status(400).json({ success, message: "There is already a pincode exists with this code" })
        }

        // creating a new pincode object
        let newPincode = {};
        if(code){
            newPincode.code = code; 
        }
        if(city){ newPincode.city = city}
          

        pincode = await Pincode.findByIdAndUpdate(pincodeId, { $set: newPincode }, { new: true });
        
        success = true;
        return res.json({ success, message: pincode });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteAPincode = async (req, res) => {
    let success = false;
    const {pincodeId} = req.params;

    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("pincode") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"pincode not allowed"}) 
         }
        // checking if the user exists or not
        let pincode = await Pincode.findById(pincodeId);
        if (!pincode) {
            return res.status(404).json({ success, message: "Not found" })
        }
        
        pincode = await Pincode.findByIdAndDelete(pincodeId);
        
        success = true;
        return res.json({ success, message: pincode });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addPincode, getAllPincode,getPincodeByCity, updateAPincode, deleteAPincode } 