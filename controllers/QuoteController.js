const jwt = require('jsonwebtoken');
require('dotenv').config();
const Quote = require('../models/QuoteModel');
const Booking = require('../models/BookingModel');
const Technician = require('../models/TechnicianModel');
const SuperAdmin = require('../models/SuperAdminModel');

const addQuote = async (req, res) => {
    let success = false;
    const { bookingId , price } = req.body;
    try {
        // Quote will be added by technician only
        let  technicianId;
       
        if (req.technician) {
            technicianId = req.technician;
            //check if the user exists or not
            let technician = await Technician.findById(technicianId);
            if (!technician) {
                return res.status(404).json({ success, message: "Technician not found" })
            }
        }
        
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // check if the booking exists or not
        let booking = await Booking.findById(bookingId);
        if(!booking){
            return res.status(404).json({success , message:"Booking not found"})
        }

        if(booking.selectedQuote){
            return res.status(400).json({success , message:"This booking is already assigned to another technician"})
        }
        // check if the technician quote in this booking or not
        let quote = await Quote.findOne({$and:[{booking:bookingId},{technician:technicianId}]})
        if(quote){
            return res.status(400).json({success , message:"You already quote in this booking"})
        }
        quote = await Quote.create({
            booking:bookingId,
            technician:technicianId,
            price,
            date:new Date().getTime()
        })
        await Booking.findByIdAndUpdate(bookingId , {$push:{quotes:quote._id , technicians:technicianId}},{new:true})
        success = true;
        return res.json({ success, message:quote });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllQuote = async (req, res) => {
    let success = false;
    const { page, size } = req.query;
    try {
        let superAdminId;
        
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("booking") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Booking not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // const pattern = `${query}`
        const noOfQuotes = (await Quote.find()).length
        const quotes= await Quote.find().limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { quotes, noOfQuotes } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}


const getAllQuoteOfATechnician = async (req, res) => {
    let success = false;
    const { page, size } = req.query;
    
    try {
        let technicianId;
        if (req.technician) {
            technicianId = req.technician;
            //check if the user exists or not
            let technician = await Technician.findById(technicianId);
            if (!technician) {
                return res.status(404).json({ success, message: "Technician not found" })
            }
        }
        
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // const pattern = `${query}`
        const noOfQuotes = (await Quote.find({technician:technicianId})).length
        const quotes= await Quote.find({technician:technicianId}).limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { quotes, noOfQuotes } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getAllQuoteOfABooking = async (req, res) => {
    let success = false;
    const { page, size } = req.query;
    const {bookingId} = req.params;
    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("booking") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Booking not allowed"}) 
             }
            
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // const pattern = `${query}`
        const noOfQuotes = (await Quote.find({booking:bookingId})).length
        const quotes= await Quote.find({booking:bookingId}).populate(["technician"]).limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { quotes, noOfQuotes } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}


const approveAQuoteByAdmin = async (req, res) => {
    let success = false;
    const {quoteId} = req.params;

    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("booking") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Booking not allowed"}) 
             }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        
        // checking if the quote exists or not
        let quote = await Quote.findById(quoteId);
        if (!quote) {
            return res.status(404).json({ success, message: "Quote Not found" })
        }
        if(quote.status === "Rejected"){
            return res.status(400).json({success , message:"You can not approve a rejected quote"})
        }

        if(quote.status === "Approved"){
            return res.status(400).json({success , message:"This quote is already approved"})
        }
        
        // approve the quote
        quote = await Quote.findByIdAndUpdate(quoteId , {$set:{status:"Approved"}},{new:true});

        // setting this quote as the selectedQuote of the booking and change the status of the booking as Assigned
        let booking = await Booking.findByIdAndUpdate(quote.booking , {$set:{selectedQuote:quoteId , status:"Assigned"}});

        //reject all the other quote of this booking
        for (let index = 0; index < booking.quotes.length; index++) {
            const newQuote = booking.quotes[index];
            if(newQuote.toString() !== quoteId.toString()){
                await Quote.findByIdAndUpdate(newQuote,{$set:{status:"Rejected"}},{new:true})
            }
        }
        
        success = true;
        return res.json({ success, message: quote });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addQuote, getAllQuote, getAllQuoteOfABooking, approveAQuoteByAdmin ,getAllQuoteOfATechnician } 