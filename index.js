const connectToMongo = require("./db");
var cors = require("cors");
// var bodyParser = require('body-parser')


connectToMongo();

const express = require('express')
const app = express()
const port = 5005
// app.use(bodyParser.urlencoded({ extended: false }))  // for form-encode
app.use(cors());
// to use request.body we need to use below middileware
app.use(express.json());
app.use("/static",express.static("static") )

// available routes
app.use("/api/user",require('./routes/UserRoute'));
app.use("/api/super-admin", require("./routes/SuperAdminRoute"));
app.use("/api/city", require("./routes/CityRoute"));
app.use("/api/pincode", require("./routes/PincodeRoute"));
app.use("/api/service", require("./routes/ServiceRoute"));
app.use("/api/booking", require("./routes/BookingRoute"));
app.use("/api/technician", require("./routes/TechnicianRoute"));
app.use("/api/rating", require("./routes/RatingRoute"));
app.use("/api/review", require("./routes/ReviewRoute"));
app.use("/api/quote", require("./routes/QuoteRoute"));
app.use("/api/time-slot", require("./routes/TimeSlotRoute"));
app.use("/api/terms-condition", require("./routes/TNCRoute"));
app.use("/api/role", require("./routes/RoleRoute"));

app.listen(port, () => {
  console.log(`nkb listening on port http://localhost:${port}`)
})