const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const URL = process.env.URL

const connectDB = async ()=>{
    try{
        await mongoose.connect(URL, {
            useCreateIndex: true,
            useFindAndModify: false,
            useNewUrlParser:true,
            useUnifiedTopology: true
        })
        console.log('Mongodb Connected...')

    } catch (err){
        console.error(err)
    }
}

module.exports = connectDB

