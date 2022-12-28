const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Profile = require('../../models/Profile')
const {body, validationResult } = require('express-validator')
const Post = require('../../models/Post')

// route /api/posts
// Create a new post
// Access: Private
router.post('/', [auth, [
    body('text', 'Text is required').not().isEmpty()
]], async (req, res)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try{
        const user =  await User.findById(req.user.id).select('-password')

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            picture: user.picture,
            user: req.user.id
        })

         const post =  await newPost.save()
         res.json(post)

    } catch(err){
        console.error(err)
        res.status(500).json({msg: 'Server Error' })
    }

})

// route /api/posts
// Get All Posts
// Access: Private
router.get('/', [auth], async(req, res)=>{
    try{
        const posts = await Post.find().sort({date: -1})
        res.json(posts)

    } catch(err){
        console.error(err)
        res.status(500).json({msg: 'Server Error' })
    }
})

// route /api/posts/:id
// Get post by id
// Access: Private
router.get('/:id', [auth], async(req, res)=>{
    try{
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(400).json({ msg: 'No Post found' })
        }
        res.json(post)

    } catch(err){
        console.error(err)
        res.status(500).json({msg: 'Server Error' })
    }
})

// route /api/posts/:id
// Delete post who created the post only
// Access: Private
router.delete('/:id', [auth], async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(400).json({ msg: 'No Post found' })
        }

        // Check if user who requested own the post
        if(req.user.id !== post.user.toString() ){
            return res.status(401).json({ msg: 'User not Authorized' })
        }

        await post.remove()
        res.json({ msg: 'Post removed successfully' })
      
    } catch(err){
        console.error(err)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post Not Found'})
        }
        res.status(500).json({msg: 'Server Error' })
    }
})

// route /api/posts/like/:id
// Like Post
// Access: Private
router.post('/like/:id', [auth], async(req, res)=>{
    try{
        const post = await Post.findById(req.params.id)
        // Check if post exists
        if(!post){
            return res.status(401).json({ msg: 'Post not found' })
        }

        // Check if post is already liked by user
        if( 
            post.likes.filter(like => like.user.toString() === req.user.id ).length > 0
         ){
             return res.status(401).json({ msg: 'Post is already liked' })
         }
         post.likes.unshift({ user: req.user.id })
         await post.save()
         res.json(post.likes)

    } catch(err){
        console.error(err)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post Not Found'})
        }
        res.status(500).json({msg: 'Server Error' })
    }
})

// route /api/posts/unlike/:id
// Unlike Post
// Access: Private
router.post('/unlike/:id', [auth], async(req, res)=>{
    try {
        const post = await Post.findById(req.params.id)
        // Check if post exists
        if(!post){
            return res.status(401).json({ msg: 'Post not found' })
        }

        // Check if post is liked yet
        if(
            post.likes.filter(like => like.user.toString() === req.user.id).length === 0
        ) {
            return res.status(401).json({ msg: 'Post has not liked yet' })
        }

        // get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)
        await post.save()
        res.json(post.likes)

        
        
    } catch(err){
        console.error(err)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post Not Found'})
        }
        res.status(500).json({msg: 'Server Error' })
    }
})

// route /api/posts/comment/:id
// Comment Post
// Access: Private
router.post('/comment/:id', [auth, [
    body('text', 'Text is required').not().isEmpty()
]], async(req, res)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try{
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)

        const newComment = {
            text: req.body.text,
            name: user.name,
            user: req.user.id,
            picture: user.picture
        }
        
        post.comments.unshift(newComment)
        await post.save()
        res.json(post.comments)

    } catch(err){
        console.error(err)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post Not Found'})
        }
        res.status(500).json({msg: 'Server Error' })
    }

})

// route /api/posts/comment/:id/:comment_id
// Delete Comment
// Access: Private
router.delete('/comment/:id/:comment_id', [auth], async(req, res)=>{
    try{
        const post = await Post.findById(req.params.id)

        // Pull the comment
         const comment = post.comments.find(comment => comment.id.toString() === req.params.comment_id)

        // Make sure the comment exists
        if(!comment){
            return res.status(400).json({ msg: 'No Comment Found!' })
        }

        // Check if the user own the comment delete
        if(comment.user.toString() !== req.user.id){
            return res.status(400).json({ msg: 'User has not permission to delete the comment' })
        }

        // Get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)
        post.comments.splice(removeIndex, 1)
        await post.save()
        res.json(post.comments)

    } catch(err){
        console.error(err)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post Not Found'})
        }
        res.status(500).json({msg: 'Server Error' })
    }

})

module.exports = router