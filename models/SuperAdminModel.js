const mongoose=require("mongoose");
const { Schema } = mongoose;

const SuperAdminSchema = new Schema({
  
  name:{
    type:String,
    required:true,
  },
  
  password:{
    type:String,
    required:true,
  },  

  date:{
    type:Number,
    required:true
  }
  
});

const SuperAdmin = mongoose.model("superadmin",SuperAdminSchema);
module.exports = SuperAdmin;