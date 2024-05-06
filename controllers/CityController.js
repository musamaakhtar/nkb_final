const jwt = require('jsonwebtoken');
require('dotenv').config();
const City = require('../models/CityModel');
const Pincode = require('../models/PincodeModel');
const SuperAdmin = require('../models/SuperAdminModel');
const Technician = require('../models/TechnicianModel');
const User = require('../models/UserModel');

const addCity = async (req, res) => {
    let success = false;
    const { name } = req.body;
    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("city") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"City not allowed"}) 
         }
        // check if the city exists or not
        let city = await City.findOne({ name });
        if (city) {
            return res.status(400).json({ success, message: "There is already one city with this name" })
        }
        city = await City.create({
            name,
            date: new Date().getTime()
        })
        success = true;
        return res.json({ success, message: city });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllCity = async (req, res) => {
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
            if(!superAdmin.role.roles.includes("city") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"City not allowed"}) 
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
        let noOfCities = (await City.find({ name: { $regex: pattern } })).length
        let cities = await City.find({ name: { $regex: pattern } }).limit(size).skip(size * page);
        
        if(req.superAdmin){
            let superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("city") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"City not allowed"}) 
             }
             
             cities = await City.find({ name: { $regex: pattern } })
             if (superAdmin.role.name !== "Admin"){
             cities = cities.filter(city=>superAdmin.cities.includes(city._id.toString()))
             }
             noOfCities = cities.length;
             cities = cities.slice(page * size, (page + 1) * size);

        }
        success = true;
        return res.json({ success, message: { cities, noOfCities } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateACity = async (req, res) => {
    let success = false;
    const { name } = req.body;
    const { cityId } = req.params;

    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("city") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"City not allowed"}) 
         }
        // checkig if the city exists or not
        let city = await City.findById(cityId);
        if (!city) {
            return res.status(404).json({ success, message: "Not found" })
        }

        // checking if there is an city with this name or not
        city = await City.findOne({ name });
        if (city && city._id.toString()!==cityId.toString()) {
            return res.status(400).json({ success, message: "There is already a city exists with this name" })
        }

        // creating a new city object
        let newCity = {};
        newCity.name = name;

        city = await City.findByIdAndUpdate(cityId, { $set: newCity }, { new: true });

        success = true;
        return res.json({ success, message: city });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteACity = async (req, res) => {
    let success = false;
    const { cityId } = req.params;

    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("city") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"City not allowed"}) 
         }
        // checking if the user exists or not
        let city = await City.findById(cityId);
        if (!city) {
            return res.status(404).json({ success, message: "Not found" })
        }
        // delete associates pincode with this city
        await Pincode.deleteMany({ city: cityId });
        city = await City.findByIdAndDelete(cityId);

        success = true;
        return res.json({ success, message: city });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addCity, getAllCity, updateACity, deleteACity } 