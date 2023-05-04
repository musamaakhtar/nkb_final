const jwt = require('jsonwebtoken');
require('dotenv').config();
const Booking = require('../models/BookingModel');
const Quote = require('../models/QuoteModel');
const User = require('../models/UserModel');
const Technician = require('../models/TechnicianModel');
const SuperAdmin = require('../models/SuperAdminModel');
const Service = require('../models/ServiceModel');
const City = require('../models/CityModel');
const Pincode = require('../models/PincodeModel');

const addBooking = async (req, res) => {
    let success = false;
    const { bookingDate, time, service, city, pincode, permanentAddress, temporaryAddress, description } = req.body;
    try {
        const id = req.user;
        //check if the user exists or not
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success, message: "User not found" })
        }

        let images = [];
        for (let index = 0; index < req.files.images?.length; index++) {
            const element = req.files.images[index];
            images.push(`${process.env.HOST}/static/images/bookings/${element.filename}`)
        }

        // check if the service , city and pincode exists or not
        let newService = await Service.findById(service)
        if(!newService){
            return res.status(404).json({success , message:"No service found"})
        }

        let newCity = await City.findById(city)
        if(!newCity){
            return res.status(404).json({success , message:"No city found"})
        }

        let newPincode = await Pincode.findById(pincode)
        if(!newPincode){
            return res.status(404).json({success , message:"No pincode found"})
        }


        let booking = await Booking.create({
            bookingDate: new Date(bookingDate),
            time,
            user: id,
            pics: images,
            service,
            city,
            pincode,
            temporaryAddress,
            permanentAddress,
            description,
            date: new Date().getTime()
        })
        success = true;
        return res.json({ success, message: booking });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllBooking = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }

        const pattern = `${query}`
        const noOfBookings = (await Booking.find({ status: { $regex: pattern } })).length
        const bookings = await Booking.find({ status: { $regex: pattern } }).populate(["service", "city", "pincode"]).limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { bookings, noOfBookings } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}


const getUserSpecificBooking = async (req, res) => {
    let success = false;
    const { page, size, status } = req.query;
    try {
        const id = req.user;
        //check if the user exists or not
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success, message: "User not found" })
        }

        if (status && status !== "In-Progress" && status !== "Assigned" && status !== "Started" && status !== "Completed" && status !== "Wating" && status!=="Cancelled") {
            return res.status(400).json({ success, message: "Status should be In-Progress , Assigned , Started , Wating or Completed" })
        }
        let noOfBookings, bookings;
        if (status) {
            noOfBookings = (await Booking.find({ $and: [{ user: id }, { status }] })).length
            bookings = await Booking.find({ $and: [{ user: id }, { status }] }).populate("service").limit(size).skip(size * page);
        }
        else {
            noOfBookings = (await Booking.find({ user: id })).length
            bookings = await Booking.find({ user: id }).populate("service").limit(size).skip(size * page);
        }

        success = true;
        return res.json({ success, message: { bookings, noOfBookings } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getABookingDetails = async (req, res) => {
    let success = false;
    const { bookingId } = req.params;
    try {
        let id, technicianId;
        if (req.user) {
            id = req.user;
            //check if the user exists or not
            let user = await User.findById(id);
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
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        let booking;
        if (id) {
            booking = await Booking.findOne({ $and: [{ user: id }, { _id: bookingId }] }).populate(["service", "city", "pincode" , "selectedQuote", "user"]);
        }
        else {
            booking = await Booking.findOne({ _id: bookingId }).populate(["service", "city", "pincode" , "selectedQuote" , "user"]);
        }


        if (!booking) {
            return res.status(404).json({ success, message: "Booking not found" })
        }

        success = true;
        return res.json({ success, message: booking });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}



const updateABooking = async (req, res) => {
    let success = false;
    const { bookingDate, time, selectedQuote, status, additionalInfo, otp , verifyId } = req.body;
    const { bookingId } = req.params;

    try {

        // checking if the booking exists or not
        let booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success, message: "Booking Not found" })
        }

        if (req.user) {
            // user can update date and time
            const userId = req.user;
            let user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success, message: "User not found" })
            }

            if (user._id.toString !== booking.user.toString) {
                return res.status(400).json({ success, message: "You can not update others booking" })
            }
            // create a new Booking object 
            let newBooking = {};
            if (bookingDate) {
                newBooking.bookingDate = new Date(bookingDate).getTime
            }
            if (time) {
                newBooking.time = time
            }
            if (otp) {
                if (booking.status === "In-Progress") {
                    return res.status(400).json({ success, message: "This booking is not assigned yet" })
                }
                else if (booking.status === "Assigned" && booking.otp.toString() === otp) {
                    newBooking.status = "Started";
                    newBooking.otp = "";
                }
                else if (booking.status === "Started" && booking.otp.toString() === otp) {
                    newBooking.status = "Completed";
                    newBooking.otp = "";
                }
                else {
                    return res.status(400).json({ success, message: "This booking is completed" })
                }
            }
            if (status) {
                if (booking.status.toString() === "Wating" && (status === "Assigned" || status === "Cancelled")) {
                    newBooking.status = status;
                }
                if (booking.status.toString() === "Assigned" && status==="Started") {
                    newBooking.status = status;
                }
                if (booking.status.toString() === "Started" && status==="Completed") {
                    newBooking.status = status;
                }


            }
            booking = await Booking.findByIdAndUpdate(bookingId, { $set: newBooking }, { new: true })

        }
        else if (req.technician) {
            
            const technicianId = req.technician;
            let technician = await Technician.findById(technicianId)
            if (!technician) {
                return res.status(404).json({ success, message: "Technician not found" })
            }
            if (otp) {
                if (booking.status === "In-Progress") {
                    return res.status(400).json({ success, message: "This booking is not assigned yet" })
                }
                else if (booking.status === "Assigned") {
                    
                    await Booking.findByIdAndUpdate(bookingId, { $set: { otp: otp } }, { new: true });
                }
                else if (booking.status === "Started") {
                    await Booking.findByIdAndUpdate(bookingId, { $set: { otp: otp } }, { new: true });
                }
                else {
                    return res.status(400).json({ success, message: "This booking is completed" })
                }
            }
            if(verifyId){
                if(booking.status=== "Assigned" || booking.status === "Started"){
                    await Booking.findByIdAndUpdate(bookingId, { $set: { verifyId: verifyId } }, { new: true });
                }
            }
        }

        else if (req.superAdmin) {
            let id = req.superAdmin;
            //check if the super admin exists or not
            let superAdmin = await SuperAdmin.findById(id);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }

            // create a new Booking object 
            let newBooking = {};
            if (selectedQuote) {
                // check if the quote exists or not
                let quote = await Quote.findById(selectedQuote);
                if (!quote) {
                    return res.status(404).json({ success, message: "Quote not found" })
                }
                if (quote.booking.toString() !== bookingId.toString()) {
                    return res.status(400).json({ success, message: "This quote is not belong to the booking" })
                }

                // update the quote status of all the quote of this booking
                await Quote.updateMany({ booking: bookingId }, { $set: { status: "Rejected" } }, { new: true });
                await Quote.findByIdAndUpdate(selectedQuote, { $set: { status: "Approved" } }, { new: true })

                newBooking.selectedQuote = selectedQuote
                newBooking.status = "Wating"
                newBooking.technician = quote.technician;
            }
            if (status) {
                newBooking.status = status
            }
            if (additionalInfo) {
                newBooking.additionalInfo = additionalInfo
            }
            booking = await Booking.findByIdAndUpdate(bookingId, { $set: newBooking }, { new: true })

        }
        booking = await Booking.findById(bookingId)
        success = true;
        return res.json({ success, message: booking });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteABooking = async (req, res) => {
    let success = false;
    const { bookingId } = req.params;

    try {
        let userId, superAdminId;
        if (req.user) {
            userId = req.user;
            //check if the user exists or not
            let user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success, message: "User not found" })
            }
        }
        else if (req.superAdmin) {
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

        // checking if the user exists or not
        let booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success, message: "Not found" })
        }

        booking = await Booking.findByIdAndDelete(bookingId);

        success = true;
        return res.json({ success, message: booking });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addBooking, getAllBooking, getUserSpecificBooking, getABookingDetails, updateABooking, deleteABooking } 