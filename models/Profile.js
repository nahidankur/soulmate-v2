const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    profession: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim : true
    },
    location : {
        type: String
    },
    skills : {
        type: [String]
    },
    bio: {
        type: String
    },
    education: [
        {
            school :{
                type: String,
                required: true
            },
            from : {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            university: {
                type: String,
                required: true
            },
            degree: {
                type: String,
                required: true
            },
            fieldofstudy:  {
                type: String,
                required: true
            },
            description: {
                type: String
            }
        }
    ], 
    experience : [
        {
            title: {
                type: String,
                required: true
            },
            company: {
                type: String,
                required: true
            },
            location : {
                type: String

            },
            from: {
                type: Date,
                required: true
            }, 
            to: {
                type: Date
            },
            description: {
                type: String
            }
        }
    ], 
    date : {
        type: Date,
        default: Date.now
    }


})

const profile = mongoose.model('profile', ProfileSchema)

module.exports = profile