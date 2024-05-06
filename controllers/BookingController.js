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
const TimeSlot = require('../models/TimeSlotModel');
let handlebars = require("handlebars");
let puppeteer = require("puppeteer");
let path = require("path");
const { default: axios } = require('axios');
const Review = require('../models/ReviewModel');
const Rating = require('../models/RatingModel');
const companyName = "NKB";
const companyGST = "VBNMJH3467ifxcjkbjvh56"
const companyAddress = "dfcvbghk rghnuikl,hg cc hmmnfgh eghjkl"
const companyContactDetails = "1111111111"



const generateReport = async (req, res) => {
    let success = false;
    const { gst, email } = req.query;
    const data = {

        billingAddress: "ertk09oukj sdfghji09uiknb xryjunb tyhyihkjhn tryy8uy",
        invoiceNo: new Date().getTime(),
        invoiceDate: new Date().toLocaleDateString("sv"),

    }
    const { invoiceNo, invoiceDate } = data;
    const { bookingId } = req.params;
    try {
        let booking = await Booking.findById(bookingId).populate(["user", "selectedQuote", "service"])
        if (booking.status.toString() !== "Completed") {
            return res.status(400).json({ success, message: "You booking is not completed yet" })
        }
        if (booking.pdf) {
            return res.status(400).json({ success, message: "Report is alreay generated" })
        }

        const source = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            * {
                padding: 0;
                margin: 0;
                box-sizing: border-box;
                
            }
            .invoiceDetails{
                border-bottom: 2px solid black;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
    
            .invoiceLeft{
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: space-between;
                gap: 20px;
            }
    
            
    
            .tableBoody {
                width: 100%;
                background-color: #fffb;
                margin: .8rem auto;
                overflow: auto;
                
            }
    
            .tableBoody::-webkit-scrollbar {
                width: 0.5rem;
                height: 0.5rem;
            }
    
            .tableBoody::-webkit-scrollbar-thumb {
                border-radius: 0.5rem;
                background-color: #0004;
            }
    
            .table {
                width: 100%;
                padding: 1rem;
                border-collapse: collapse;
    
            }
    
            
    
            .td {
                padding: .5rem;
                border-collapse: collapse;
                text-align: center;
                border: 1px solid black;
            }
    
            .th {
                padding: .1rem;
                border-collapse: collapse;
                border: 1px solid black;
            }
    
            
    
            .thead .th {
                position: sticky;
                top: 0;
                /* left: 0; */
                background-color: #f0bb0b;
                /* border: 1px solid white; */
            }
    
            .gstSection {
                padding: 10px;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                flex-direction: column;
                width: 100%;
                gap: 10px;
            }
    
            .gstSectionItem {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                font-size: 12px;
                font-weight: 600;
            }
    
            .gstSectionSubItem {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 30%;
                border-bottom: 1px solid black;
            }
        </style>
    </head>
    <body>
        <div class="" style="padding: 20px;">
        <div class="" style="color: #f0bb0b;width: 100%;text-align: center;font-size: 24px;font-weight: 800;margin: 10px;">TAX INVOICE</div>
        <div class="tableBoody" style="border: none;">
            <table class="table">
                <thead class="thead">
                    <tr class="tr" style="border: none;">
                        <th class="th" style="width:70%;text-align: left;border: none;padding: 10px;font-size: 20px;font-weight: 600;" colspan="5">${companyName}</th>
    
                        <th class="th" style="width:30%;text-align: right;border: none;padding: 10px;font-size: 20px;font-weight: 600;">
                        ${companyGST}
                        </th>
    
    
                    </tr>
                </thead>
    
    
            </table>
        </div>
        <div class="invoiceDetails">
            <div class="invoiceLeft">
                <span>${companyAddress}</span>
                <span>${companyContactDetails}</span>
            </div>
            <div class="invoiceRight">
                <table style="border-collapse: collapse;margin-bottom: 5px;">
                    <tbody>
                        <tr>
                            <td class="td" style="width: 120px;">Invoice No.</td>
                            <td class="td" style="width: 120px;">${invoiceNo}</td>
                        </tr>
                        <tr>
                            <td class="td" style="width: 120px;">Invoice Date:</td>
                            <td class="td" style="width: 120px;">${invoiceDate}</td>
                        </tr>
                    </tbody>
                </table>
                
            </div>
        </div>
        <div class="gstSection">
            <div class="gstSectionItem">
                <span  style="font-size: 14px;font-weight: 600;">Customer Details</span>
                
            </div>
            <div class="gstSectionItem">
                <span  style="font-size: 14px;font-weight: 600;">Name</span>
                <span class="gstSectionSubItem" style="width: 80%;">
                    <span style="margin-left: 10px;font-size: 14px;font-weight: 600;">${booking.user.name}</span>
                    
                </span>
            </div>
            <div class="gstSectionItem">
                <span  style="font-size: 14px;font-weight: 600;">GST IN</span>
                <span class="gstSectionSubItem" style="width: 80%;">
                    <span style="margin-left: 10px;font-size: 14px;font-weight: 600;">${gst}</span>
                    
                </span>
            </div>
            <div class="gstSectionItem">
                <span style="padding-bottom: 30px;font-size: 14px;font-weight: 600;">Address</span>
                <span class="gstSectionSubItem" style="width: 80%;padding-bottom: 30px;">
                    <span style="margin-left: 10px;font-size: 14px;font-weight: 300;">${booking.temporaryAddress}</span>
                    
                </span>
            </div>
            <div class="gstSectionItem">
                <span style="display: flex; align-items: center;justify-content: flex-start;gap: 10px;">
                    <span  style="font-size: 14px;font-weight: 600;">Mobile No.</span>
                    <span  style="font-size: 14px;font-weight: 600;">${booking.user.phone}</span>
                </span>
                <span class="gstSectionSubItem" style="width: 50%;border: none;">
                    <span style="display: flex; align-items: center;justify-content: flex-start;gap: 10px;">
                        <span  style="font-size: 14px;font-weight: 600;">Email ID</span>
                        <span  style="font-size: 14px;font-weight: 600;">${email}</span>
                    </span>
                </span>
            </div>
            
        </div>
        <div class="tableBoody">
            <table class="table" style="height: 25vh;">
                <thead class="thead">
                    <tr class="tr">
                        <th class="th" style="width:5%;">SL NO</th>
                        <th class="th" style="width:45%;">DESCRIPTION OF GOODS</th>
                        <th class="th" style="width:8%;">HSN Code</th>
                        <th class="th" style="width:10%;">Qty</th>
                        <th class="th" style="width:12%;">Rate(Rs)</th>
                        <th class="th" style="width:20%;">Taxable Amount(Rs)</th>
    
    
                    </tr>
                </thead>
                <tbody class="tbody" style="height:calc( 25vh - 50px );">
                    <tr class="tr">
    
                        <td class="td">1</td>
                        <td class="td">${booking.service ? booking.service.name : "No description provided"}</td>
                        <td class="td"></td>
                        <td class="td">1</td>
                        <td class="td">${booking.selectedQuote.price}</td>
                        <td class="td">${booking.selectedQuote.price}</td>
    
                    </tr>
                    
    
    
                </tbody>
                <thead class="thead">
                    <tr class="tr" style="height: 30px;">
    
                        <th class="th" colspan="2" style="width:45%;text-align: left;">Total Taxable Value</th>
                        <th class="th" style="width:8%;"></th>
                        <th class="th" style="width:10%;"></th>
                        <th class="th" style="width:12%;"></th>
                        <th class="th" style="width:20%;text-align: right;">${booking.selectedQuote.price}</th>
    
    
                    </tr>
                </thead>
            </table>
    
        </div>
        <div class="gstSection">
            <div class="gstSectionItem">
                <span>Amount of IGST</span>
                <span class="gstSectionSubItem">
                    <span style="margin-left: 10px;">9.00%</span>
                    <span style="margin-right: 10px;">${booking.selectedQuote.price * .09}</span>
                </span>
            </div>
            <div class="gstSectionItem">
                <span>Amount of CGST</span>
                <span class="gstSectionSubItem">
                    <span style="margin-left: 10px;">9.00%</span>
                    <span style="margin-right: 10px;">${booking.selectedQuote.price * .09}</span>
                </span>
            </div>
            <div class="gstSectionItem">
                <span>Amount of SGST</span>
                <span class="gstSectionSubItem">
                    <span style="margin-left: 10px;">18.00%</span>
                    <span style="margin-right: 10px;">${booking.selectedQuote.price * .18}</span>
                </span>
            </div>
            <div class="gstSectionItem">
                <span>Round Off</span>
                <span style="margin-right: 10px;">
                    ${Math.ceil(booking.selectedQuote.price * .54)}
                </span>
            </div>
    
        </div>
        <div class="tableBoody" style="height: 50px;">
            <table class="table" style="height: 50px;">
                <thead class="thead" style="height: 50px;">
                    <tr class="tr" style="height: 50px;">
                        <th class="th" style="width:80%;text-align: left;" colspan="5">Total Invoice Value</th>
    
                        <th class="th" style="width:20%;text-align: right;">${booking.selectedQuote.price + Math.ceil(booking.selectedQuote.price * .54)}</th>
    
    
                    </tr>
                </thead>
    
    
            </table>
        </div>
        <div class="gstSection">
            <div class="gstSectionItem">
                <span>E & O.E</span>
            </div>
            <div class="gstSectionItem">
                <span>Declaration:-</span>
            </div>
            <div class="gstSectionItem">
                <span>Terms and Conditions</span>
                <span style="margin-right: 10px;font-size: 14px;">
                    For ${companyName}
                </span>
            </div>
            <div class="gstSectionItem">
                <span>1</span>
            </div>
            <div class="gstSectionItem">
                <span>2</span>
            </div>
            <div class="gstSectionItem">
                <span></span>
                <span style="margin-right: 10px;font-size: 14px;display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center;">
                <img src="../static/images/signature/signature.jpg" alt="Signature" width="50" height="10">
                    Authorised Signatory
                </span>
            </div>
        </div>
    </div>
    </body>
    </html>`



        const template = handlebars.compile(source);
        const html = template(data);
        // const browser = await puppeteer.launch({ headless: "new" })
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser'
        })
        const page = await browser.newPage();
        await page.setContent(html)
        // const pdf = await page.pdf({format:"A4"})
        let pdf = await page.pdf({ path: `static/images/invoices/${invoiceNo}.pdf`, format: 'A4', printBackground: true, });

        await browser.close();
        res.set('Content-Type', 'application/pdf')
        // await Booking.findByIdAndUpdate(bookingId,{$set:{pdf:`http://localhost:5005/static/images/invoices/${invoiceNo}.pdf`}},{new:true})
        await Booking.findByIdAndUpdate(bookingId, { $set: { pdf: `https://api.nkbtech.in/static/images/invoices/${invoiceNo}.pdf` } }, { new: true })
        res.send(pdf)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success, message: "Internal server error" })
    }
};


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

        // check if the service , city and pincode , time exists or not
        let newService = await Service.findById(service)
        if (!newService) {
            return res.status(404).json({ success, message: "No service found" })
        }

        let newCity = await City.findById(city)
        if (!newCity) {
            return res.status(404).json({ success, message: "No city found" })
        }

        let newPincode = await Pincode.findById(pincode)
        if (!newPincode) {
            return res.status(404).json({ success, message: "No pincode found" })
        }

        let newTime = await TimeSlot.findById(time)
        if (!newTime) {
            return res.status(404).json({ success, message: "No time slot found" })
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
            isApproved: false,
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
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }

        if (!superAdmin.role.roles.includes("booking") && superAdmin.role.name !== "Admin") {
            return res.status(400).json({ success, message: "Booking not allowed" })
        }

        const pattern = `${query}`

        let bookings = await Booking.find({ status: { $regex: pattern } }).populate(["service", "city", "pincode", "time"])

        if (superAdmin.role.name !== "Admin") {
            bookings = bookings.filter(booking=>booking.city!==null)
            bookings = bookings.filter(booking => superAdmin.cities.includes(booking.city._id.toString()))
        }
        const noOfBookings = bookings.length
        bookings = bookings.slice(page * size, (page + 1) * size);

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

        if (status && status !== "In-Progress" && status !== "Assigned" && status !== "Started" && status !== "Completed" && status !== "Wating" && status !== "Cancelled") {
            return res.status(400).json({ success, message: "Status should be In-Progress , Assigned , Started , Wating or Completed" })
        }
        let noOfBookings, bookings;
        if (status) {
            noOfBookings = (await Booking.find({ $and: [{ user: id }, { status }] })).length
            bookings = await Booking.find({ $and: [{ user: id }, { status }] }).populate(["service", "time"]).limit(size).skip(size * page);
        }
        else {
            noOfBookings = (await Booking.find({ user: id })).length
            bookings = await Booking.find({ user: id }).populate(["service", "time"]).limit(size).skip(size * page);
        }

        success = true;
        return res.json({ success, message: { bookings, noOfBookings } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getUserSpecificInvoice = async (req, res) => {
    let success = false;
    
    try {
        const id = req.user;
        //check if the user exists or not
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success, message: "User not found" })
        }
        let bookings = await Booking.find({ $and: [{ user: id }, { status: "Completed" }, { pdf: { $ne: "" } }] }).populate(["service"])

        success = false;
        return res.json({ success, message: bookings })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getAllInvoice = async (req, res) => {
    let success = false;
    const { page, size } = req.query;
    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }

        if (!superAdmin.role.roles.includes("invoice") && superAdmin.role.name !== "Admin") {
            return res.status(400).json({ success, message: "Invoice not allowed" })
        }
        let noOfInvoices = (await Booking.find({ $and: [{ status: "Completed" }, { pdf: { $ne: "" } }] })).length
        let invoices = await Booking.find({ $and: [{ status: "Completed" }, { pdf: { $ne: "" } }] }).populate(["service"]).limit(size).skip(size * page);

        success = false;
        return res.json({ success, message: {invoices , noOfInvoices} })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const sendOtp = async (req, res) => {
    let success = false;
    const { bookingId } = req.body;
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

        let booking = await Booking.findById(bookingId).populate(["user", "technician"])
        console.log(booking)
        if (booking.status.toString() !== "Assigned" && booking.status.toString() !== "Started") {
            return res.status(400).json({ success, message: "Status of booking should be Assigned or Started to send a otp" })
        }
        if (technicianId.toString() !== booking.technician._id.toString()) {
            return res.status(400).json({ success, message: "This booking is not assigned to you , So you can not send otp" })
        }

        let { data } = await axios.get(`https://2factor.in/API/V1/f1611593-0712-11eb-9fa5-0200cd936042/SMS/+91${booking.user.phone}/AUTOGEN2/OTP1`);
        // update the otp of the booking
        await Booking.findByIdAndUpdate(bookingId, { $set: { otp: data.OTP } }, { new: true });
        success = true;
        return res.json({ success, message: "otp sent successfully to the user" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const getABookingDetails = async (req, res) => {
    let success = false;
    const { bookingId } = req.params;
    try {
        let id, technicianId, superAdminId;
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
        else if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if (!superAdmin.role.roles.includes("booking") && superAdmin.role.name !== "Admin") {
                return res.status(400).json({ success, message: "Booking not allowed" })
            }
        }
        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        let booking;
        if (id) {
            booking = await Booking.findOne({ $and: [{ user: id }, { _id: bookingId }] }).populate(["service", "city", "pincode", "selectedQuote", "user", "time", "rating", "review"]);
        }
        else {
            booking = await Booking.findOne({ _id: bookingId }).populate(["service", "city", "pincode", "selectedQuote", "user", "time", "rating", "review"]);
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
    // console.log(req.body)
    const { bookingDate, time, selectedQuote, status, additionalInfo, otp, verifyId, isApproved, platformCommission } = req.body;
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
                let newTime = await TimeSlot.findById(time)
                if (!newTime) {
                    return res.status(404).json({ success, message: "No time slot found" })
                }
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
                if(status){
                    newBooking.status = status;
                }
                if (booking.status.toString() === "Assigned" && status === "Started") {
                    newBooking.status = status;
                }
                if (booking.status.toString() === "Started" && status === "Completed") {
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
            // if (otp) {
            //     if (booking.status === "In-Progress") {
            //         return res.status(400).json({ success, message: "This booking is not assigned yet" })
            //     }
            //     else if (booking.status === "Assigned") {

            //         await Booking.findByIdAndUpdate(bookingId, { $set: { otp: otp } }, { new: true });
            //     }
            //     else if (booking.status === "Started") {
            //         await Booking.findByIdAndUpdate(bookingId, { $set: { otp: otp } }, { new: true });
            //     }
            //     else {
            //         return res.status(400).json({ success, message: "This booking is completed" })
            //     }
            // }
            // if (verifyId) {
            //     if (booking.status === "Assigned" || booking.status === "Started") {
            //         await Booking.findByIdAndUpdate(bookingId, { $set: { verifyId: verifyId } }, { new: true });
            //     }
            // }
        }

        else if (req.superAdmin) {
            let id = req.superAdmin;
            //check if the super admin exists or not
            let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if (!superAdmin.role.roles.includes("booking") && superAdmin.role.name !== "Admin") {
                return res.status(400).json({ success, message: "Booking not allowed" })
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

                if(quote.status.toString()!=="Pending"){
                    return res.status(400).json({success , message:"Another quote of this booking is already approved"})
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
                // console.log(bookingId , status)
            }
            if (additionalInfo) {
                newBooking.additionalInfo = additionalInfo
            }
            if (platformCommission) {
                newBooking.platformCommission = parseInt(platformCommission)
            }
            if (isApproved || isApproved === false) {
                newBooking.isApproved = isApproved;
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


const addMoreImages = async (req, res) => {
    let success = false;
    const { bookingId } = req.params;

    try {

        // checking if the booking exists or not
        let booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success, message: "Booking Not found" })
        }

        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if (!superAdmin.role.roles.includes("booking") && superAdmin.role.name !== "Admin") {
            return res.status(400).json({ success, message: "Booking not allowed" })
        }

        // create a new Booking object 
        let newBooking = {};
        newBooking.pics = booking.pics;
        for (let index = 0; index < req.files.images?.length; index++) {
            const element = req.files.images[index];
            newBooking.pics.push(`${process.env.HOST}/static/images/bookings/${element.filename}`)
        }
        booking = await Booking.findByIdAndUpdate(bookingId, { $set: newBooking }, { new: true })



        success = true;
        return res.json({ success, message: booking });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteAnImage = async (req, res) => {
    let success = false;
    const { bookingId } = req.params;
    const { imageNo } = req.body
    try {

        // checking if the booking exists or not
        let booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success, message: "Booking Not found" })
        }

        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if (!superAdmin.role.roles.includes("booking") && superAdmin.role.name !== "Admin") {
            return res.status(400).json({ success, message: "Booking not allowed" })
        }

        // create a new Booking object 
        let newBooking = {};
        newBooking.pics = booking.pics.filter((image, index) => index !== parseInt(imageNo));

        booking = await Booking.findByIdAndUpdate(bookingId, { $set: newBooking }, { new: true })



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
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if (!superAdmin.role.roles.includes("booking") && superAdmin.role.name !== "Admin") {
                return res.status(400).json({ success, message: "Booking not allowed" })
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

        // delete rating , review and quote for this booking
        await Quote.deleteMany({booking:bookingId});
        await Rating.deleteMany({booking:bookingId});
        await Review.deleteMany({booking:bookingId});
        booking = await Booking.findByIdAndDelete(bookingId);
        

        success = true;
        return res.json({ success, message: booking });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addBooking, getAllBooking, getUserSpecificBooking, getABookingDetails, getUserSpecificInvoice, sendOtp, generateReport, updateABooking, deleteABooking, addMoreImages, deleteAnImage, getAllInvoice } 