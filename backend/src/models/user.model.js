const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
    unique:true,
    trim:true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema,'rmc');

module.exports=User