const jwt = require('jsonwebtoken');
require('dotenv').config();
const Technician = require('../models/TechnicianModel');
const City = require('../models/CityModel');
const Service = require('../models/ServiceModel');
const Rating = require('../models/RatingModel');
const Review = require('../models/ReviewModel');
const Booking = require('../models/BookingModel');
const SuperAdmin = require('../models/SuperAdminModel');
const User = require('../models/UserModel');
const Quote = require('../models/QuoteModel');



const loginTechnician = async (req, res) => {
    let success = false;
    const { phone } = req.body;
    try {
        const app = req.myapp;
        if (app!=="nkb") {
            return res.status(401).json({ success, message: "Token wrong" })
        }
        // check if the technician exists or not
        let technician = await Technician.findOne({ phone });

        if (!technician) {
            return res.status(404).json({ success, message: "Sorry you do not have any account" })
        };
        if (!technician.isApproved) {
            return res.status(400).json({ success, message: "Sorry your account is not approved yet by admin" })
        }

        // creating jwt token
        const data = { technician: technician._id };
        const authTechnician = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "7d" })

        success = true;
        return res.json({ success, authTechnician, id: technician._id.toString() });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }

}

const addTechnician = async (req, res) => {
    let success = false;
    const { name, phone, city, category } = req.body;
    try {
        const app = req.myapp;
        if (app!=="nkb") {
            return res.status(401).json({ success, message: "Token wrong" })
        }
        // check if the technician exists or not
        let technician = await Technician.findOne({ phone });

        if (technician) {
            return res.status(400).json({ success, message: "You already have an account" })

        };

        // check if any user used this number or not
        let user = await User.findOne({phone});
        if(user){
            return res.status(400).json({success , message:"Sorry this number already used"})
        }

        technician = await Technician.create({
            name,
            phone,
            city,
            category,
            date:new Date().getTime()
        })

        success = true;
        return res.json({ success, message: "Your account created successfully . Please wait for admin's approval" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }

}

const getTechnician = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }

        const pattern = `${query}`
        const noOfTechnicians = (await Technician.find({ phone: { $regex: pattern } })).length
        const technicians = await Technician.find({ phone: { $regex: pattern } }).populate(["city" , "category"]).limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { technicians, noOfTechnicians } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getTechnicianById = async (req, res) => {
    let success = false;
    try {
        let id = req.technician;
        // checking if the interest exists or not
        let technician = await Technician.findById(id);
        if (!technician) {
            return res.status(404).json({ success, message: "Not found" })
        }

        success = true;
        return res.json({ success, message: technician });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getBookingsByTechnician = async (req, res) => {
    let success = false;
    const {status} = req.query
    try {
        // console.log("bookings by technician api hitted")
        let id = req.technician;
        // checking if the technician exists or not
        let technician = await Technician.findById(id);
        if (!technician) {
            return res.status(404).json({ success, message: "Not found" })
        }
        if (status && status !== "In-Progress" && status !== "Assigned" && status !== "Started" && status !== "Completed" && status!=="Cancelled") {
            return res.status(400).json({ success, message: "Status should be In-Progress , Assigned , Started , Completed or Cancelled" })
        }
        let bookings;
        if(status && status==="In-Progress"){
            bookings = await Booking.find({$and:[{city:technician.city},{service:technician.category}]}).populate(["pincode"])
            bookings = bookings.filter(booking=> !booking.technicians.includes(id))
        }
        else if(status){
            bookings = await Booking.find({$and:[{technician:id},{status:status}]}).populate(["pincode"])
        }
        else{
            bookings = await Booking.find({$and:[{city:technician.city},{service:technician.category}]}).populate(["pincode"])
        }
        
        // .select["pincode" , "bookingDate" , "time" , "description"]
        // console.log(bookings)
        success = true;
        return res.json({ success, message: bookings });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getQuotedBookingsByTechnician = async (req, res) => {
    let success = false;
    try {
        // console.log("bookings by technician api hitted")
        let id = req.technician;
        // checking if the technician exists or not
        let technician = await Technician.findById(id);
        if (!technician) {
            return res.status(404).json({ success, message: "Not found" })
        }
        let bookings =[];
        let quotes = await Quote.find({$and:[{technician:id},{status:"Pending"}]})
        for (let index = 0; index < quotes.length; index++) {
            const quote = quotes[index];
            let booking = await Booking.findById(quote.booking).populate(["pincode"])
            booking = {...booking._doc , price:quote.price}
            bookings.push(booking)
        }
        // .select["pincode" , "bookingDate" , "time" , "description"]
        // console.log(bookings)
        success = true;
        return res.json({ success, message: bookings });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getTechnicianByIdInAdmin = async (req, res) => {
    let success = false;
    const { id } = req.params;
    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // checking if the interest exists or not
        let technician = await Technician.findById(id);
        if (!technician) {
            return res.status(404).json({ success, message: "Not found" })
        }

        success = true;
        return res.json({ success, message: technician });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateTechnician = async (req, res) => {
    let success = false;
    const { name, city, category   } = req.body;
    const {technicianId} = req.params;

    try {
        let id , superAdminId;
        if(req.superAdmin){
            superAdminId = req.superAdmin
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
        }
        else if(req.technician){
            id = req.technician;
            if(id.toString()!==technicianId.toString()){
                return res.status(400).json({success , message:"You can not update other technician details"})
            }
        }
        else{
            return res.status(401).json({success , message:"No valid token found"})
        }
        
        
        // checkig if the interest exists or not
        let technician = await Technician.findById(technicianId);
        if (!technician) {
            return res.status(404).json({ success, message: "Not found" })
        }

        // creating a new technician object
        let newTechnician = {};
        if (name) { newTechnician.name = name };
        if (req.file) {
            newTechnician.profilePic = `${process.env.HOST}/static/images/technicians/${req.file.filename}`
        }
        if (city) {
            // check if the city exists or not
            let newCity = await City.findById(city);
            if (newCity) {
                newTechnician.city = city
            }
        };
        if (category) {
            // check if the category exists or not
            let newCategory = await Service.findById(category);
            if (newCategory) {
                newTechnician.category = category
            }
        }
        

        technician = await Technician.findByIdAndUpdate(technicianId, { $set: newTechnician }, { new: true });
        

        
        success = true;
        return res.json({ success, message: technician });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const approveATechnician = async (req, res) => {
    let success = false;
    const {technicianId} = req.body;
    try {
        let  superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }

        let technician = await Technician.findById(technicianId);
        if(!technician){
            return res.status(404).json({success , message:"Technician not found"})
        }        

        technician = await Technician.findByIdAndUpdate(technicianId, { $set: {isApproved:!technician.isApproved} }, { new: true });       

        
        success = true;
        return res.json({ success, message: technician });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteTechnician = async (req, res) => {
    let success = false;

const {technicianId} = req.params;
    try {
        let id , superAdminId;
        if(req.superAdmin){
            superAdminId = req.superAdmin
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
        }
        else if(req.technician){
            id = req.technician;
            if(id.toString()!==technicianId.toString()){
                return res.status(400).json({success , message:"You can not delete other technician"})
            }
        }
        else{
            return res.status(401).json({success , message:"No valid token found"})
        }
        // checking if the technician exists or not
        let technician = await Technician.findById(technicianId);
        if (!technician) {
            return res.status(404).json({ success, message: "Not found" })
        }

        technician = await Technician.findByIdAndDelete(technicianId);
        success = true;
        return res.json({ success, message: technician });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { loginTechnician, addTechnician, getTechnician, getTechnicianById,getBookingsByTechnician,getQuotedBookingsByTechnician, getTechnicianByIdInAdmin, updateTechnician, approveATechnician, deleteTechnician } 