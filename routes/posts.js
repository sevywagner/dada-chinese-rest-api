const express = require('express');
const { body } = require('express-validator');
const postController = require('./../controllers/posts');
const isAuth = require('./../middleware/is-auth');

const router = express.Router();

router.get('/auth/google', postController.getAuthUrl);
router.get('/auth/redirect', postController.getRedirect);

router.get('/posts', [
    body('title').isLength({ min: 3 }).withMessage('Please enter a valid title'),
    body('content').isLength({ min: 5 }).withMessage('Blog is too short')
], postController.getPosts);
router.post('/posts', [
    body('title').isLength({ min: 3 }).withMessage('Please enter a valid title'),
    body('content').isLength({ min: 5 }).withMessage('Blog is too short')
], isAuth, postController.postCreatePost);

router.put('/edit-post', isAuth, postController.putEditPost);

router.delete('/delete-post', isAuth, postController.deletePost);

module.exports = router;