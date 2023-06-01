const jwt = require('jsonwebtoken');
require('dotenv').config();
const Role = require('../models/RoleModel');
const Pincode = require('../models/PincodeModel');
const SuperAdmin = require('../models/SuperAdminModel');
const Technician = require('../models/TechnicianModel');
const User = require('../models/UserModel');

const addRole = async (req, res) => {
    let success = false;
    const { name, roles } = req.body;
    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        // if(!superAdmin.role.roles.includes("role") && superAdmin.role.name!=="Admin"){
        //     return res.status(400).json({success , message:"Role not allowed"}) 
        //  }
        // check if the role exists or not
        let role = await Role.findOne({ name });
        if (role) {
            return res.status(400).json({ success, message: "There is already one role with this name" })
        }
        let newRoles = []
        for (let index = 0; index < roles.length; index++) {
            const role = roles[index];
            newRoles.push(role.toLowerCase());
        }
        role = await Role.create({
            name,
            roles: newRoles,
            date: new Date().getTime()
        })
        success = true;
        return res.json({ success, message: role });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "internal server error" });
    }
}

const getAllRole = async (req, res) => {
    let success = false;
    const { query, page, size } = req.query;
    try {
        let superAdminId;
        if (req.superAdmin) {
            superAdminId = req.superAdmin;
            //check if the user exists or not
            let superAdmin = await SuperAdmin.findById(superAdminId).populate(["role"]);
            // console.log(superAdmin);
            if (!superAdmin) {
                return res.status(404).json({ success, message: "Super Admin not found" })
            }
            if(!superAdmin.role.roles.includes("role") && superAdmin.role.name!=="Admin"){
                return res.status(400).json({success , message:"Role not allowed"}) 
             }
        }

        else {
            return res.status(401).json({ success, message: "No valid token found" })
        }
        const pattern = `${query}`
        const noOfRoles = (await Role.find({ name: { $regex: pattern } })).length
        const roles = await Role.find({ name: { $regex: pattern } }).limit(size).skip(size * page);
        success = true;
        return res.json({ success, message: { roles, noOfRoles } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const updateARole = async (req, res) => {
    let success = false;
    const { name, roles } = req.body;
    const { roleId } = req.params;

    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("role") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"Role not allowed"}) 
         }
        // checkig if the role exists or not
        let role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ success, message: "Not found" })
        }



        // creating a new role object
        let newRole = {};
        if (name) {
            // checking if there is an role with this name or not
            role = await Role.findOne({ name });
            if (role && role._id.toString() !== roleId.toString()) {
                return res.status(400).json({ success, message: "There is already a role exists with this name" })
            }
            newRole.name = name;
        }
        if (roles) {
            let newRoles = []
            for (let index = 0; index < roles.length; index++) {
                const role = roles[index];
                newRoles.push(role.toLowerCase());
            }
            newRole.roles = newRoles;
        }


        role = await Role.findByIdAndUpdate(roleId, { $set: newRole }, { new: true });

        success = true;
        return res.json({ success, message: role });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

const deleteARole = async (req, res) => {
    let success = false;
    const { roleId } = req.params;

    try {
        let id = req.superAdmin;
        //check if the super admin exists or not
        let superAdmin = await SuperAdmin.findById(id).populate(["role"]);
        if (!superAdmin) {
            return res.status(404).json({ success, message: "Super Admin not found" })
        }
        if(!superAdmin.role.roles.includes("role") && superAdmin.role.name!=="Admin"){
            return res.status(400).json({success , message:"Role not allowed"}) 
         }
        // checking if the user exists or not
        let role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ success, message: "Not found" })
        }

        role = await Role.findByIdAndDelete(roleId);

        success = true;
        return res.json({ success, message: role });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success, message: "Internal server error" });
    }
}

module.exports = { addRole, getAllRole, updateARole, deleteARole } 