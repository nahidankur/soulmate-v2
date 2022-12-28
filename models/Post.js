const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    text : {
        type: String,
        required: true
    },
    name : {
        type: String
    },
    picture: {
        type: String
    },
    likes : [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ], 
    comments : [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            picture: {
                type: String
            },
            name: {
                type: String
            },
            date : {
                type: Date,
                default: Date.now
            }
        }
    ], 
    date: {
        type: Date,
        default: Date.now
    }
})

const Post = mongoose.model('post', PostSchema)

module.exports = Post