const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('./../models/post');

exports.getPosts = (req, res, next) => {
    Post.fetchAll().then((posts) => {
        notFoundErrorHandler(posts, 'Unable to get list of posts');
        res.status(200).json({
            posts: posts
        });
    }).catch((err) => {
        catchHandler(err, next);
    });
}

exports.postCreatePost = (req, res, next) => {
    const errors = validationResult(req);
    validationErrorHandler(errors, 'Invalid input');

    if (!req.isAdmin) {
        return res.status(401).json({
            message: 'You are not authenticated'
        });
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path;
    const videoUrl = req.body.videoUrl;
    const date = req.body.date;
    
    const post = new Post(title, content, imageUrl, videoUrl, date);

    post.save().then(() => {
        console.log('Added');
        res.status(201).json({
            message: 'Success'
        });
    }).catch(err => {
        catchHandler(err, next);
    });
}

exports.putEditPost = (req, res, next) => {
    const errors = validationResult(req);
    validationErrorHandler(errors, 'Invalid input');

    if (!req.isAdmin) {
        return res.status(401).json({
            message: 'You are not authenticated'
        });
    }

    const postId = req.body.id;
    
    const title = req.body.title;
    const content = req.body.content;
    const date = req.body.date;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
        imageUrl = req.file.path;
        deleteFile(req.body.imageUrl);
    }
    const videoUrl = req.body.videoUrl;

    const updatedPost = new Post(title, content, imageUrl, videoUrl, date, postId);

    updatedPost.update().then((result) => {
        console.log('Updated');
        res.status(201).json({
            message: 'Post updated',
            post: result
        });
    }).catch((err) => {
        catchHandler(err, next);
    });
}

exports.deletePost = (req, res, next) => {
    const postId = req.body.postId;
    let loadedPost;

    if (!req.isAdmin) {
        return res.status(401).json({
            message: 'You are not authenticated'
        });
    }

    Post.findById(postId).then((post) => {
        notFoundErrorHandler(post, 'Post not found');

        loadedPost = post;
        return Post.delete(post._id);
    }).then((result) => {
        console.log(result);
        deleteFile(loadedPost.imageUrl);
        res.status(201).json({
            message: 'Successfully deleted post'
        });
    }).catch((err) => {
        catchHandler(err);
    });
}

const catchHandler = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}

const deleteFile = (url) => {
    fs.unlink(path.join(__dirname, '..', url), (err) => {
        if (err) {
            console.log(err);
        }
    });
}

const validationErrorHandler = (errors, message) => {
    if (!errors.isEmpty()) {
        const error = new Error(message);
        error.statusCode = 422;
        throw error;
    }
}

const notFoundErrorHandler = (item, message) => {
    if (!item) {
        const error = new Error(message);
        error.statusCode = 404;
        throw error;
    }
}