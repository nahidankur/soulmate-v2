const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        require: true,
        trim: true
    },
    email : {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    picture : {
        type: String
    },
    date : {
        type: Date,
        default: Date.now
    }
})

const user = mongoose.model('user', UserSchema)

module.exports = user