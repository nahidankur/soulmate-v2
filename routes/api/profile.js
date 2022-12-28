const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Profile = require('../../models/Profile')
const {body, validationResult } = require('express-validator')
const Post = require('../../models/Post')
const user = require('../../models/User')

// route: /api/profile/me
// Get Cuurent User Profile
// acces: Private
router.get('/me', auth, async  (req, res)=>{
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'picture'])
        if(!profile){
            return res.status(400).json({ msg: 'No Profile found for this user' })
        }
        res.json(profile)

    } catch(err){
        console.error(err)
        res.status(500).json({msg : 'Server Error'})
    }
 
  
})

// route: /api/profile
// Create and Update User Profile
// acces: Private
router.post('/', [auth, [
    body('profession', 'Profession is required').not().isEmpty(),
    body('company', 'Company is required').not().isEmpty(),
    body('location', 'Location is required').not().isEmpty()
]], async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array() })
    }

    const {profession, company, location,skills, bio } = req.body

    const profileFields = {}
    profileFields.user = req.user.id
    if(profession) profileFields.profession = profession
    if(company) profileFields.company = company
    if(location) profileFields.location = location
    if(bio) profileFields.bio = bio
    if(skills) profileFields.skills = skills.split(',').map(skill => skill.trim())

    try{
        let profile = await Profile.findOne({ user: req.user.id })
        if(profile){
            // Update Profile

            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true}
            )
            return res.json({ profile })
        }

        // Create Profile if profile does not exist
        profile = new Profile(profileFields)
        await profile.save()
        res.json(profile)
         
    } catch(err){
        console.error(err)
        res.status(500).json({msg : 'Server Error'})
    }

})

// route: /api/profile
// Get All Profiles
// acces: Private
router.get('/', auth, async (req, res)=>{
    try{
        const profile = await Profile.find().populate('user', ['name', 'picture'])
        res.json({profile})

    }catch(err){
        console.error(err)
        res.status(500).json({msg : 'Server Error'})
    }
})

// route: /api/profile/user/:user_id
// Get profile by id
// acces: Private
router.get('/user/:user_id', async(req, res)=>{
    try{
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'picture'])

        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }
        res.json(profile)

    } catch(err){
        console.error(err)
        if(err.kind === 'ObjectId'){
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }
        res.status(500).json({msg : 'Server Error'})
    }
})

// route: /api/profile
// Delete user, profile and post
// acces: Private
router.delete('/', auth, async (req, res)=>{
    try{
        // Delete Post
         await Post.deleteMany({ user: req.user.id })
        // Delete Profile
        await Profile.findOneAndRemove({ user: req.user.id })

        // Delete user
        await User.findOneAndRemove({_id : req.user.id })
        res.json( { msg: 'User deleted successfully' })

    } catch(err){
        console.error(err)
        res.status(500).json({msg : 'Server Error'})
    }
})

// route: /api/profile/experience
// Add Experience
// acces: Private
router.post('/experience', [auth, [
    body('title', 'Title is required').not().isEmpty(),
    body('company', 'Company is required').not().isEmpty(),
    body('from', 'From date is required').not().isEmpty()
]], async (req, res)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const {title, company, location, from, to,description } = req.body

    const newExp = { title, company, location, from, to,description}

    try{
        const profile = await Profile.findOne({ user: req.user.id })
        profile.experience.unshift(newExp)
        await profile.save()
        res.json({ newExp })

    } catch(err){
        console.error(err)
        res.status(500).json({msg : 'Server Error'})
    }

})

// route: /api/profile/experience/:exp_id
// Remove Experience from profile
// acces: Private
router.delete('/experience/:exp_id', auth, async (req, res)=>{
    try{
        const profile = await Profile.findOne({ user: req.user.id })

        const removeIndex = profile.experience.map(item=> item.id).indexOf(req.params.exp_id)
        profile.experience.splice(removeIndex, 1)

        await profile.save()
        res.json( profile )

    } catch(err){
        console.error(err)
        res.status(500).json({msg : 'Server Error'})
    }

})

// route: /api/profile/education
// Add Education
// acces: Private
router.post('/education', [auth, [
    body('school', 'School is required').not().isEmpty(),
    body('from', 'From date is required').not().isEmpty(),
    body('degree', 'Degree is required').not().isEmpty(),
    body('university', 'University is required').not().isEmpty(),
    body('fieldofstudy', 'Field of study is required').not().isEmpty()
]], async(req, res)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { school, from , to, university, degree, fieldofstudy, description } = req.body

    const newEdu = { school, from , to, university, degree, fieldofstudy, description }
    
    try{
        const profile = await Profile.findOne({ user: req.user.id })
        profile.education.unshift(newEdu)
       await profile.save()
       res.json(newEdu)

    } catch(err){
        console.error(err)
        res.status(500).json({msg : 'Server Error'})
    }
   

})

// route: /api/profile/education/:edu_id
// Remove Education from profile
// acces: Private
router.delete('/education/:edu_id', auth, async (req, res)=>{
    try{
        const profile = await Profile.findOne({ user: req.user.id })

        const removeIndex = profile.education.map(item=> item.id).indexOf(req.params.edu_id)
        profile.education.splice(removeIndex, 1)

        await profile.save()
        res.json( profile )

    } catch(err){
        console.error(err)
        res.status(500).json({msg : 'Server Error'})
    }

})




module.exports = router