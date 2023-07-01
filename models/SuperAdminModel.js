const mongoose=require("mongoose");
const { Schema } = mongoose;

const SuperAdminSchema = new Schema({
  
  name:{
    type:String,
    required:true,
    unique:true
  },
  phone:{
    type:String,
    required:true,
    unique:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  role:{ type: Schema.Types.ObjectId, ref: 'role' },
  cities: [{ type: Schema.Types.ObjectId, ref: 'city' }], 
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