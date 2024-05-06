const jwt = require('jsonwebtoken');
require('dotenv').config();
const Technician = require('../models/TechnicianModel');
const City = require('../models/CityModel');
const Pincode = require('../models/PincodeModel');
const Service = require('../models/ServiceModel');
const Rating = require('../models/RatingModel');
const Review = require('../models/ReviewModel');
const Booking = require('../models/BookingModel');
const SuperAdmin = require('../models/SuperAdminModel');
const User = require('../models/UserModel');
const Quote = require('../models/QuoteModel');
const { default: axios } = require('axios');



const loginTechnician = async (req, res) => {
    let success = false;
    const { phone , otp } = req.body;
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

        // if(technician.otp !== parseInt(otp)){
        //     return res.status(400).json({success , message:"Please enter correct otp"})
        // }

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
    const { name, phone, city,pincode, category } = req.body;
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

        // check if city , pincode and category exists
        let newCity = await City.findById(city);
        if(!newCity){
            return res.status(404).json({success , message:"City not found"})
        }
        let newPincode = await Pincode.findById(pincode);
        if(!newPincode){
            return res.status(404).json({success , message:"Pincode not found"})
        }
        let newCategory = await Service.findById(category);
        if(!newCategory){
            return res.status(404).json({success , message:"Category not found"})
        }

        technician = await Technician.create({
            name,
            phone,
            city,
            pincode,
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

const sendOTPToTechnician = async (req, res) => {
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

        let {data} = await axios.get(`https://2factor.in/API/V1/f1611593-0712-11eb-9fa5-0200cd936042/SMS/+91${phone}/AUTOGEN2/OTP1`);
        // update the otp of the user
        await Technician.findOneAndUpdate({ phone } , {$set:{otp:data.OTP}} , {new:true});



        success = true;
        return res.json({ success, message:"otp sent successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }

}

const getTechnician = async (req, res) => {
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
            if(!superAdmin.role.roles.includes("technician") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Technician not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }

        const pattern = `${query}`
        
        let technicians = await Technician.find({ phone: { $regex: pattern } }).populate(["city" , "category","pincode"])
        // console.log(technicians)
        if (superAdmin.role.name !== "Admin") {
            technicians = technicians.filter(technician=>technician.city!==null)
            technicians = technicians.filter(technician => {
                
                return superAdmin.cities.includes(technician.city._id.toString())
            })
        }
        const noOfTechnicians = technicians.length;
        technicians = technicians.slice(page * size, (page + 1) * size);
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
            bookings = await Booking.find({$and:[{pincode:technician.pincode},{service:technician.category},{isApproved:{$ne:false}}]}).populate(["pincode","time"])
            bookings = bookings.filter(booking=> !booking.technicians.includes(id))
        }
        else if(status){
            bookings = await Booking.find({$and:[{technician:id},{status:status},{isApproved:{$ne:false}}]}).populate(["pincode","time"])
        }
        else{
            bookings = await Booking.find({$and:[{pincode:technician.pincode},{service:technician.category},{isApproved:{$ne:false}}]}).populate(["pincode","time"])
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
            let booking = await Booking.findById(quote.booking).populate(["pincode","time"])
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
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("technician") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Technician not allowed"}) 
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
    const { name, city, category ,pincode  } = req.body;
    const {technicianId} = req.params;

    try {
        let id , superAdminId;
        if(req.superAdmin){
            superAdminId = req.superAdmin
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("technician") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Technician not allowed"}) 
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
        if (pincode) {
            // check if the category exists or not
            let newPincode = await Pincode.findById(pincode);
            if (newPincode) {
                newTechnician.pincode = pincode
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
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("technician") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Technician not allowed"}) 
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
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("technician") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Technician not allowed"}) 
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

module.exports = { loginTechnician, addTechnician,sendOTPToTechnician, getTechnician, getTechnicianById,getBookingsByTechnician,getQuotedBookingsByTechnician, getTechnicianByIdInAdmin, updateTechnician, approveATechnician, deleteTechnician } 