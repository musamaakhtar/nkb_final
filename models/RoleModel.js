const mongoose = require("mongoose");
const { Schema } = mongoose;

const RoleSchema = new Schema({

  name: {
    type: String,
    required:true
  },
  roles: {
    type: Array,
    default:[]
  }, 
  date:{
    type:Number,
    required:true
  }

});

const Role = mongoose.model("role", RoleSchema);
module.exports = Role;