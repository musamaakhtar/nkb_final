const jwt = require('jsonwebtoken');
require('dotenv').config();


const fetchall = async (req, res, next) => {
    // get the user from the JWT token and add id to req object
    const usertoken = req.header("authUser");
    // get the technician from the JWT token and add id to req object
    const techniciantoken = req.header("authTechnician");
    // get the main admin from the JWT token and add id to req object
    const superAdmintoken = req.header("authSuperAdmin");
    // get the app from the JWT token and add id to req object
    const apptoken = req.header("authNKB")

    // if (!usertoken && !techniciantoken && !superAdmintoken && !apptoken) {
    //     res.status(401).send({ error: "Token not found" });
    // }

    try {
        if (usertoken) {
            const data = jwt.verify(usertoken, process.env.JWT_SECRET);
            req.user = data.user;
        }
        else if (techniciantoken) {
            const data = jwt.verify(techniciantoken, process.env.JWT_SECRET);
            req.technician = data.technician;
        }
        else if (superAdmintoken) {      
            const data = jwt.verify(superAdmintoken, process.env.JWT_SECRET);
            req.superAdmin = data.superAdmin;
        }
        else if (apptoken) {
            const data = jwt.verify(apptoken, process.env.JWT_SECRET);
            req.myapp = data.app;
        }
        else{
            // res.status(401).send({ error: "Token not found" });
        }

        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
}

module.exports = fetchall;