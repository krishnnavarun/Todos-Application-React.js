const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
     email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim: true
     },
     password:{
        type:String,
        required:true
     },
     name:{
        type:String,
        required:true,
        trim: true
     },
     role:{
        type:String,
        enum:["customer", "admin"],
        default:"customer"
     },
     profileImage:{
        type:String,
        default:null
     }
    },
    {timestamps:true}
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("users", userSchema);

module.exports = User;