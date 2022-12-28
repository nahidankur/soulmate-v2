const express = require('express')
const router = express.Router()
const {body, validationResult }  = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const dotenv = require('dotenv')
dotenv.config()

router.get('/', (req, res)=>{
    res.json({msg : 'Masti re masti'})
})

// route: /api/users
// register user
// acces: Public
router.post('/', [
    body('name', 'Please include a name').not().isEmpty(),
    body('email', 'Please include a valid email address').isEmail(),
    body('password', 'Password must be at least 6 character').isLength({min: 6})
], async (req, res)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
       return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, picture } = req.body
    
    try{
       let user = await User.findOne({email})
       if(user){
           return res.status(400).json({ errors : [{ msg: 'User already registered' }] })
       }
       user = new User({
           name, email, password, picture
       })

       const salt = await bcrypt.genSalt(10)
       user.password = await bcrypt.hash(password, salt)

       await user.save()

       const payload = {
           user : {
               id: user.id
           }
       }

       jwt.sign(payload, process.env.jwtSecret, {expiresIn : '10 days'}, (err, token)=>{
           if(err) throw err
           res.json({token})
       } )



    } catch(err){
        res.status(500).json({msg : 'Server Error'})
    }

})

module.exports = router