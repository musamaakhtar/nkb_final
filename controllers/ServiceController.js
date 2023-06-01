const jwt = require('jsonwebtoken');
require('dotenv').config();
const Service = require('../models/ServiceModel');
const SuperAdmin = require('../models/SuperAdminModel');
const Technician = require('../models/TechnicianModel');
const User = require('../models/UserModel');
const Pincode = require('../models/PincodeModel');
const City = require('../models/CityModel');

const addService = async (req, res) => {
    let success = false;
    const { name, pincode, city } = req.body;
    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("service") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Service not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        if (!req.file) {
            return res.status(400).json({ success, message: "You have to upload an image" })
        }
        // check if the service exists or not
        let service = await Service.findOne({ name });
        if (service) {
            return res.status(400).json({ success, message: "There is already one service with this name" })
        }

        // checking if pincode or city exists
        let newPincode = await Pincode.findById(pincode);
        if (!newPincode) {
            return res.status(404).json({ success, message: "No pincode found" })
        }
        let newCity = await City.findById(city);
        if (!newCity) {
            return res.status(404).json({ success, message: "No city found" })
        }
        service = await Service.create({
            name,
            pincode,
            city,
            icon: `${process.env.HOST}/static/images/services/${req.file.filename}`,
            date: new Date().getTime()
        })
        success = true;
        return res.json({ success, message: service });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllService = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let userId, technicianId, superAdminId, appId;
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
            if(!superAdmin.role.roles.includes("service") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Service not allowed"}) 
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
        let noOfServices;
        let services;
        if (req.user) {
            let userId = req.user;
            let user = await User.findById(userId);
            noOfServices = (await Service.find({$and:[{ name: { $regex: pattern } },{city:user.city.toString()},{pincode:user.pincode.toString()}]})).length
            services = await Service.find({$and:[{ name: { $regex: pattern } },{city:user.city.toString()},{pincode:user.pincode.toString()}]}).populate(["city" , "pincode"]).limit(size).skip(size * page);
        }
        else {
            noOfServices = (await Service.find({ name: { $regex: pattern } })).length
            services = await Service.find({ name: { $regex: pattern } }).populate(["city" , "pincode"]).limit(size).skip(size * page);
            // let allServices = await Service.find().populate(["city","pincode"]);
            
            // if(query!==""){
            //     allServices = allServices.filter((singleService)=>singleService.pincode.code.includes(query))
            // }
            
            
            // noOfServices = allServices.length;
            // services = allServices.slice(page * size, (page + 1) * size);
        }

        success = true;
        return res.json({ success, message: { services, noOfServices } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateAService = async (req, res) => {
    let success = false;
    const { name, pincode, city } = req.body;
    const { serviceId } = req.params;

    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("service") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Service not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // checkig if the service exists or not
        let service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success, message: "Not found" })
        }

        // checking if there is an service with this name or not
        service = await Service.findOne({ name });
        if (service && service._id.toString() !== serviceId.toString()) {
            return res.status(400).json({ success, message: "There is already a service exists with this name" })
        }

        // creating a new service object
        let newService = {};
        if (name) { newService.name = name }
        if (req.file) { newService.icon = `${process.env.HOST}/static/images/services/${req.file.filename}` }
        if (pincode) {
            let newPincode = await Pincode.findById(pincode);
            if (newPincode) {
                newService.pincode = pincode
            }
        }
        if (city) {
            let newCity = await City.findById(city);
            if (newCity) {
                newService.city = city
            }
        }

        service = await Service.findByIdAndUpdate(serviceId, { $set: newService }, { new: true });

        success = true;
        return res.json({ success, message: service });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteAService = async (req, res) => {
    let success = false;
    const { serviceId } = req.params;

    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("service") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Service not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // checking if the user exists or not
        let service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success, message: "Not found" })
        }
        service = await Service.findByIdAndDelete(serviceId);

        success = true;
        return res.json({ success, message: service });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addService, getAllService, updateAService, deleteAService } 