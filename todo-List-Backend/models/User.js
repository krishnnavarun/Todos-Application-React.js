const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
     email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true
     },
     password:{
        type:String,
        required:true
     },
     name:{
        type:String,
        required:true
     },
     role:{
        type:String,
        enum:["customer", "admin"],
        default:"customer"
     }
    },
    {timestamps:true}
);

const User = mongoose.model("users", userSchema);

module.exports = User;