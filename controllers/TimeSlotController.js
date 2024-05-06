const jwt = require('jsonwebtoken');
require('dotenv').config();
const TimeSlot = require('../models/TimeSlotModel');
const SuperAdmin = require('../models/SuperAdminModel');
const Technician = require('../models/TechnicianModel');
const User = require('../models/UserModel');
const City = require('../models/CityModel');
const Pincode = require('../models/PincodeModel');

const addTimeSlot = async (req, res) => {
    let success = false;
    const { time , city , pincode } = req.body;
    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("timeslots") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"Time Slot not allowed"}) 
         }
        // check if the timeSlot exists or not
        let timeSlot = await TimeSlot.findOne({$and: [{time},{city},{pincode}] });
        if (timeSlot) {
            return res.status(400).json({ success, message: "There is already one timeSlot with this time" })
        }

        // checking if city or pincode exists or not
        let newCity = await City.findById(city)
        if(!newCity){
            return res.status(404).json({success , message:"No city found"})
        }
        let newPincode = await Pincode.findById(pincode)
        if(!newPincode){
            return res.status(404).json({success , message:"No pincode found"})
        }
        timeSlot = await TimeSlot.create({
            time,
            city,
            pincode,
            date: new Date().getTime()
        })
        success = true;
        return res.json({ success, message: timeSlot });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllTimeSlot = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let userId, technicianId, superAdminId;
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
            if(!superAdmin.role.roles.includes("timeslots") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Time Slot not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        const pattern = `${query}`
        let noOfTimeSlots;
        let timeSlots;
        if(req.user){
            let userId = req.user;
            let user = await User.findById(userId);
            noOfTimeSlots = (await TimeSlot.find({$and:[{ time: { $regex: pattern } },{city:user.city.toString()},{pincode:user.pincode.toString()}]})).length
            timeSlots = await TimeSlot.find({$and:[{ time: { $regex: pattern } },{city:user.city.toString()},{pincode:user.pincode.toString()}]}).populate(["city","pincode"]).limit(size).skip(size * page);
        }
        else{
            // noOfTimeSlots = (await TimeSlot.find({ time: { $regex: pattern } })).length
            // timeSlots = await TimeSlot.find({ time: { $regex: pattern } }).populate(["city","pincode"]).limit(size).skip(size * page);
            let allTimeSlots = await TimeSlot.find().populate(["city","pincode"]);
            
            if(query!==""){
                allTimeSlots = allTimeSlots.filter((singleTime)=>singleTime.pincode.code.includes(query))
            }

            if (req.superAdmin) {
                superAdminId = req.superAdmin;
                //check if the user exists or not
                let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
                if (!superAdmin) {
                    return res.status(404).json({ success, message: "Super Admin not found" })
                }
                if(!superAdmin.role.roles.includes("timeslots") && superAdmin.role.name!=="Admin"){
                    return res.status(400).json({success , message:"Time Slot not allowed"}) 
                 }
                 if (superAdmin.role.name !== "Admin") {
                    allTimeSlots = allTimeSlots.filter(allTimeSlot=>allTimeSlot.city!==null)
                    allTimeSlots = allTimeSlots.filter(allTimeSlot => superAdmin.cities.includes(allTimeSlot.city._id.toString()))
                }
            }
            
            
            noOfTimeSlots = allTimeSlots.length;
            timeSlots = allTimeSlots.slice(page * size, (page + 1) * size);
        }
        
        success = true;
        return res.json({ success, message: { timeSlots, noOfTimeSlots} });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateATimeSlot = async (req, res) => {
    let success = false;
    const { time , city , pincode } = req.body;
    const { timeSlotId } = req.params;

    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("timeslots") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"Time Slot not allowed"}) 
         }
        // checkig if the timeSlot exists or not
        let timeSlot = await TimeSlot.findById(timeSlotId);
        if (!timeSlot) {
            return res.status(404).json({ success, message: "Not found" })
        }

        // checking if there is an timeSlot with this name or not
        timeSlot = await TimeSlot.findOne({ time });
        if (timeSlot && timeSlot._id.toString()!==timeSlotId.toString()) {
            return res.status(400).json({ success, message: "There is already a timeSlot exists with this name" })
        }

        // creating a new timeSlot object
        let newTimeSlot = {};
        if(time){
            newTimeSlot.time = time;
        }
        if(city){
            let newCity = await City.findById(city);
            if(newCity){
                newTimeSlot.city = city
            }
        }
        if(pincode){
            let newPincode = await Pincode.findById(pincode);
            if(newPincode){
                newTimeSlot.pincode = pincode
            }
        }
        

        timeSlot = await TimeSlot.findByIdAndUpdate(timeSlotId, { $set: newTimeSlot }, { new: true });

        success = true;
        return res.json({ success, message: timeSlot });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteATimeSlot = async (req, res) => {
    let success = false;
    const { timeSlotId } = req.params;

    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("timeslots") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"Time Slot not allowed"}) 
         }
        // checking if the user exists or not
        let timeSlot = await TimeSlot.findById(timeSlotId);
        if (!timeSlot) {
            return res.status(404).json({ success, message: "Not found" })
        }
     
        timeSlot = await TimeSlot.findByIdAndDelete(timeSlotId);

        success = true;
        return res.json({ success, message: timeSlot });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addTimeSlot, getAllTimeSlot, updateATimeSlot, deleteATimeSlot } 