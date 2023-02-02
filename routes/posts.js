const express = require('express');
const postController = require('./../controllers/posts');

const router = express.Router();

router.get('/posts', postController.getPosts);
router.post('/posts', postController.postCreatePost);

router.post('/edit-post', postController.postEditPost);

router.post('/delete-post', postController.postDeletePost);

module.exports = router;