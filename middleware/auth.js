const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

module.exports = function async (req, res, next){
    const token = req.header('x-auth-token')

    // if not token
    if(!token){
        return res.status(401).json({msg : 'No Token, Access Denied'})
    }

    // Verify Token
    try{
        jwt.verify(token, process.env.jwtSecret, (error, decoded)=>{
            if(error){
                return res.status(401).json({ msg: 'Invalid Token' })
            }

            req.user = decoded.user
            next()
        } )

    } catch(err){
        console.error(err)
        res.status(500).json({ msg : 'Server Error' })
    }
    
}