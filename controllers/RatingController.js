const jwt = require('jsonwebtoken');
require('dotenv').config();
const Rating = require('../models/RatingModel');
const User = require('../models/UserModel');
const Booking = require('../models/BookingModel');
const Technician = require('../models/TechnicianModel');
const SuperAdmin = require('../models/SuperAdminModel');

const addRating = async (req, res) => {
    let success = false;
    const { rating, bookingId } = req.body;
    try {
        let id = req.user;
        // check if the user exists or not
        let user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ success, message: "User not found" })
        }
        if(parseInt(rating)<1 || parseInt(rating)>5){
            return res.status(400).json({success , message:"Rating should between 1 to 5"})
        }
        // check if the booking exists or not with this bookingId
        let booking = await Booking.findById(bookingId).populate("selectedQuote")
        if (!booking) {
            return res.status(404).json({ success, message: "Booking not found" })
        }
        if (booking.status !== "Completed") {
            return res.status(400).json({ success, message: "You can not rating an incomplete booking" })
        }
        // check if you already ratinged this booking
        if (booking.rating) {
            return res.status(400).json({ success, message: "Sorry you already ratinged this booking" })
        }
        // create a new rating
        let newRating = await Rating.create({
            rating,
            user: id,
            booking: bookingId,
            technician: booking.selectedQuote.technician,
            date: new Date().getTime()
        })

        let averageRating = await Rating.aggregate([
            {
                $match: { technician:booking.selectedQuote.technician }
            },
            {
                $group: {
                    _id: null,
                    rating: { $avg: "$rating" },
                }
            }
        ])

        await Booking.findByIdAndUpdate(bookingId, { $set: { rating: newRating._id } }, { new: true })
        await Technician.findByIdAndUpdate(booking.selectedQuote.technician, { $push: { ratings: newRating._id } }, { new: true })
        await Technician.findByIdAndUpdate(booking.selectedQuote.technician, { $set: { rating: averageRating[0].rating } }, { new: true })
        await User.findByIdAndUpdate(id, { $push: { ratings: newRating._id } }, { new: true })
        success = true;
        return res.json({ success, message: newRating });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllRating = async (req, res) => {
    let success = false;
    const { page, size } = req.query;
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
        // const pattern = `${query}`
        const noOfRatings = (await Rating.find()).length
        const ratings = await Rating.find().limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { ratings, noOfRatings } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getUserOrTechnicianSpecificRating = async (req, res) => {
    let success = false;
    const { page, size } = req.query;
    try {
        let noOfRatings , ratings;
        // const pattern = `${query}`
        if(req.user){
            let userId = req.user;
            let user = await User.findById(userId);
            if(!user){
                return res.status(404).json({success , message:"User not found"})
            }
            noOfRatings = (await Rating.find({user:userId})).length
            ratings = await Rating.find({user:userId}).limit(size).skip(size * page);
        }
        else if(req.technician){
            let technicianId = req.technician;
            let technician = await Technician.findById(technicianId);
            if(!technician){
                return res.status(404).json({success , message:"Technician not found"})
            }
            noOfRatings = (await Rating.find({technician:technicianId})).length
            ratings = await Rating.find({technician:technicianId}).limit(size).skip(size * page);
        }
        
        
        success = true;
        return res.json({ success, message: { ratings, noOfRatings } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

// const updateARating = async (req, res) => {
//     let success = false;
//     const { name } = req.body;
//     const {ratingId} = req.params;

//     try {        
//         // checkig if the rating exists or not
//         let rating = await Rating.findById(ratingId);
//         if (!rating) {
//             return res.status(404).json({ success, message: "Not found" })
//         }

//         // checking if there is an rating with this name or not
//         rating = await Rating.findOne({name});
//         if (rating) {
//             return res.status(400).json({ success, message: "There is already a rating exists with this name" })
//         }

//         // creating a new rating object
//         let newRating = {};
//         newRating.name = name;    

//         rating = await Rating.findByIdAndUpdate(ratingId, { $set: newRating }, { new: true });

//         success = true;
//         return res.json({ success, message: rating });
//     } catch (error) {
//         console.error(error.message);
//         return res.status(500).json({ success, message: "Internal server error" });
//     }
// }

// const deleteARating = async (req, res) => {
//     let success = false;
//     const {ratingId} = req.params;

//     try {

//         // checking if the user exists or not
//         let rating = await Rating.findById(ratingId);
//         if (!rating) {
//             return res.status(404).json({ success, message: "Not found" })
//         }
//         // delete associates pincode with this rating
//         await Pincode.deleteMany({rating:ratingId});
//         rating = await Rating.findByIdAndDelete(ratingId);

//         success = true;
//         return res.json({ success, message: rating });
//     } catch (error) {
//         console.error(error.message);
//         return res.status(500).json({ success, message: "Internal server error" });
//     }
// }

module.exports = { addRating, getAllRating ,getUserOrTechnicianSpecificRating } 