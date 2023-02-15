const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('./../models/post');

exports.getPosts = (req, res, next) => {
    Post.fetchAll().then((posts) => {
        res.status(200).json({
            posts: posts
        });
    }).catch((err) => {
        catchHandler(err);
    });
}

exports.postCreatePost = (req, res, next) => {
    const errors = validationResult(req);
    validationErrorHandler(errors, 'Invalid input');

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path;
    const date = req.body.date;
    
    const post = new Post(title, content, imageUrl, date);
    post.save().then(() => {
        console.log('Added');
        res.status(201).json({
            message: 'Success'
        });
    }).catch(err => {
        catchHandler(err);
    });
}

exports.putEditPost = (req, res, next) => {
    const errors = validationResult(req);
    validationErrorHandler(errors, 'Invalid input');

    const postId = req.body.id;
    let loadedPost;

    Post.findById(postId).then((post) => {
        notFoundErrorHandler(post, 'Post not found');

        loadedPost = post;
    }).catch((err) => {
        catchHandler(err);
    });
    
    const title = req.body.title;
    const content = req.body.content;
    const date = req.body.date;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
        imageUrl = req.file.path;
        deleteFile(loadedPost);
    }

    const updatedPost = new Post(title, content, imageUrl, date, postId);

    updatedPost.update().then((result) => {
        console.log('Updated');
        res.status(201).json({
            message: 'Post updated',
            post: result
        });
    }).catch((err) => {
        catchHandler(err);
    });
}

exports.deletePost = (req, res, next) => {
    const postId = req.body.postId;
    let loadedPost;

    Post.findById(postId).then((post) => {
        notFoundErrorHandler(post, 'Post not found');

        loadedPost = post;
        return Post.delete(post._id);
    }).then((result) => {
        console.log(result);
        deleteFile(loadedPost);
        res.status(201).json({
            message: 'Successfully deleted post'
        });
    }).catch((err) => {
        catchHandler(err);
    });
}

const catchHandler = (err) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}

const deleteFile = (loadedPost) => {
    fs.unlink(path.join(__dirname, '..', loadedPost.imageUrl), (err) => {
        if (err) {
            throw err;
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