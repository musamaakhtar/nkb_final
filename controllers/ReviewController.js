const jwt = require('jsonwebtoken');
require('dotenv').config();
const Review = require('../models/ReviewModel');
const User = require('../models/UserModel');
const Booking = require('../models/BookingModel');
const Technician = require('../models/TechnicianModel');
const SuperAdmin = require('../models/SuperAdminModel');

const addReview = async (req, res) => {
    let success = false;
    const { review, bookingId } = req.body;
    try {
        let id = req.user;
        // check if the user exists or not
        let user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ success, message: "User not found" })
        }
        // check if the booking exists or not with this bookingId
        let booking = await Booking.findById(bookingId).populate("selectedQuote")
        if (!booking) {
            return res.status(404).json({ success, message: "Booking not found" })
        }
        if (booking.status !== "Completed") {
            return res.status(400).json({ success, message: "You can not review an incomplete booking" })
        }
        // check if you already reviewed this booking
        if (booking.review) {
            return res.status(400).json({ success, message: "Sorry you already reviewed this booking" })
        }
        // create a new review
        let newReview = await Review.create({
            review,
            user: id,
            booking: bookingId,
            technician: booking.selectedQuote.technician,
            date: new Date().getTime()
        })

        await Booking.findByIdAndUpdate(bookingId, { $set: { review: newReview._id } }, { new: true })
        await Technician.findByIdAndUpdate(booking.selectedQuote.technician, { $push: { reviews: newReview._id } }, { new: true })
        await User.findByIdAndUpdate(id, { $push: { reviews: newReview._id } }, { new: true })
        success = true;
        return res.json({ success, message: newReview });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllReview = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if (!superAdmin.role.roles.includes("review") && superAdmin.role.name !== "Admin") {
                return res.status(400).json({ success, message: "Booking not allowed" })
            }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        // const pattern = `${query}`
        // const noOfReviews = (await Review.find({ review: { $regex: pattern } })).length
        let reviews = await Review.find().populate(["user", "technician"]);
        reviews = reviews.filter(review=>((review.user?review.user.phone.toString().includes(query):"xyz".includes(query)) || (review.technician?review.technician.phone.toString().includes(query):"xyz".includes(query))))
        const noOfReviews = reviews.length
        reviews = reviews.slice(page * size, (page + 1) * size);
        success = true;
        return res.json({ success, message: { reviews, noOfReviews } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getUserOrTechnicianSpecificReview = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let noOfReviews, reviews;
        const pattern = `${query}`
        if (req.user) {
            let userId = req.user;
            let user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success, message: "User not found" })
            }
            noOfReviews = (await Review.find({ $and: [{ review: { $regex: pattern } }, { user: userId }] })).length
            reviews = await Review.find({ $and: [{ review: { $regex: pattern } }, { user: userId }] }).limit(size).skip(size * page);
        }
        else if (req.technician) {
            let technicianId = req.technician;
            let technician = await Technician.findById(technicianId);
            if (!technician) {
                return res.status(404).json({ success, message: "Technician not found" })
            }
            noOfReviews = (await Review.find({ $and: [{ review: { $regex: pattern } }, { technician: technicianId }] })).length
            reviews = await Review.find({ $and: [{ review: { $regex: pattern } }, { technician: technicianId }] }).limit(size).skip(size * page);
        }


        success = true;
        return res.json({ success, message: { reviews, noOfReviews } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateAReview = async (req, res) => {
    let success = false;
    const { reviewText } = req.body;
    const { reviewId } = req.params;

    try {
        // checkig if the review exists or not
        let review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success, message: "Not found" })
        }

        let superAdminId = req.superAdmin;
        //check if the user exists or not
        let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if (!superAdmin.role.roles.includes("review") && superAdmin.role.name !== "Admin") {
            return res.status(400).json({ success, message: "Booking not allowed" })
        }


        // creating a new review object
        let newReview = {};
        newReview.review = reviewText;

        review = await Review.findByIdAndUpdate(reviewId, { $set: newReview }, { new: true });

        success = true;
        return res.json({ success, message: review });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteAReview = async (req, res) => {
    let success = false;
    const { reviewId } = req.params;

    try {

        // checking if the user exists or not
        let review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success, message: "Not found" })
        }

        let superAdminId = req.superAdmin;
        //check if the user exists or not
        let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if (!superAdmin.role.roles.includes("review") && superAdmin.role.name !== "Admin") {
            return res.status(400).json({ success, message: "Booking not allowed" })
        }


        review = await Review.findByIdAndDelete(reviewId);

        success = true;
        return res.json({ success, message: review });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addReview, getAllReview, getUserOrTechnicianSpecificReview, updateAReview, deleteAReview } 