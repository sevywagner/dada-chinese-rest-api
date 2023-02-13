const { validationResult } = require('express-validator');
const Post = require('./../models/post');

exports.getPosts = (req, res, next) => {
    Post.fetchAll().then((posts) => {
        res.status(200).json({
            posts: posts
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.postCreatePost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Invalid input');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;
    const date = req.body.date;
    
    const post = new Post(title, content, imageUrl, date);
    post.save().then(() => {
        console.log('Added');
        res.status(201).json({
            message: 'Success'
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.putEditPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Invalid input');
        error.statusCode = 422;
        throw error;
    }

    const postId = req.body.id;
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;
    const date = req.body.date;
    
    const updatedPost = new Post(title, content, imageUrl, date, postId);

    updatedPost.update().then((result) => {
        console.log('Updated');
        res.status(201).json({
            message: 'Post updated',
            post: result
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.deletePost = (req, res, next) => {
    const postId = req.body.postId;

    Post.delete(postId).then((result) => {
        console.log(result);
        res.status(201).json({
            message: 'Successfully deleted post'
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}