const express = require('express')
const router  = express.Router()
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {body, validationResult } = require('express-validator')
const User = require('../../models/User')
const auth = require('../../middleware/auth')
const { findOne } = require('../../models/User')

// route: /api/auth
// get auth user
// acces: Private
router.get('/', auth, async (req, res)=>{
    try{
       const user =  await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch(err){
        res.status(500).json({ msg: 'Server Error' })
    }

})


// route: /api/auth
// Log in user
// access: Public
router.post('/', [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password required').exists()
], async (req, res)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const {email, password } = req.body

    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ errors : [{ msg : 'Invalid Credentials' }] })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({ errors : [{ msg : 'Invalid Credentials' }] })
        }

        const payload = {
            user : {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.jwtSecret, (err, token)=>{
            if(err) throw err
            res.json({token})
        })

    } catch(err){
        res.status(500).json({ msg: 'Server Error' })
    }

})

module.exports = router