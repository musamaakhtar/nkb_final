const mongoose=require("mongoose");
const { Schema } = mongoose;

const SubAdminSchema = new Schema({
  
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

const SubAdmin = mongoose.model("subadmin",SubAdminSchema);
module.exports = SubAdmin;