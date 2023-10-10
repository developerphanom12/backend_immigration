const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,

    },

    firstname: {
        type: String,
        required: true,
        unique: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone_number: {
        type: Number,
        unique: true,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: false
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: false
    },
    token :{
      type : String,
      require:false
    },
    profile: {
        type: String,
        default: null
    },
    // role: {
    //     type : String,
    //     enum : ["admin", "user"]
    // }
     is_deleted : {
        type: Boolean,
        default : false
     }
});

module.exports = mongoose.model('User', userSchema);
