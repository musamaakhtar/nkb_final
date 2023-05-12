const jwt = require('jsonwebtoken');
require('dotenv').config();
const TNC = require('../models/TNCModel');
const SuperAdmin = require('../models/SuperAdminModel');
const User = require('../models/UserModel');
const Technician = require('../models/TechnicianModel');


const addTerm = async (req, res) => {
    let success = false;
    const { details } = req.body;
    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("tnc") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"TNC not allowed"}) 
         }
    
        let tnc = await TNC.create({
            details,
            date: new Date().getTime()
        })
        success = true;
        return res.json({ success, message:tnc });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllTerms = async (req, res) => {
    let success = false;
    const { page, size } = req.query;
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
            if(!superAdmin.role.roles.includes("tnc") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"TNC not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        const noOfTNCs = (await TNC.find()).length
        const TNCs = await TNC.find().limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { TNCs, noOfTNCs } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateATerm = async (req, res) => {
    let success = false;
    const { details } = req.body;
    const {tncId} = req.params;

    try {  
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("tnc") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"TNC not allowed"}) 
         }      
        // checkig if the city exists or not
        let tnc = await TNC.findById(tncId);
        if (!tnc) {
            return res.status(404).json({ success, message: "Tnc Not found" })
        }

        // creating a new city object
        let newTNC = {};
        newTNC.details = details;    

        tnc = await TNC.findByIdAndUpdate(tncId, { $set: newTNC }, { new: true });
        
        success = true;
        return res.json({ success, message: tnc });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteATerm = async (req, res) => {
    let success = false;
    const {tncId} = req.params;

    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("tnc") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"Tnc not allowed"}) 
         }
        // checking if the user exists or not
        let tnc = await TNC.findById(tncId);
        if (!tnc) {
            return res.status(404).json({ success, message: "Tnc Not found" })
        }
        
        tnc = await TNC.findByIdAndDelete(tncId);
        
        success = true;
        return res.json({ success, message: tnc });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addTerm , getAllTerms , updateATerm , deleteATerm } 