const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('./../models/post');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

exports.getAuthUrl = async (req, res, next) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/drive']
    });

    res.redirect(url);
}

exports.getRedirect = async (req, res, next) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.send('<a href="https://dadachinese.com/new-blog">Back to creating a blog</a><br><a href="https://dadachinese.com/admin-blog">Back to editing a blog</a>');
}

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

exports.postCreatePost = async (req, res, next) => {
    const errors = validationResult(req);
    validationErrorHandler(errors);

    if (!req.isAdmin) {
        return res.status(401).json({
            message: 'You are not authenticated'
        });
    }

    const title = req.body.title;
    const content = req.body.content;
    const images = req.files;
    const videoUrl = req.body.videoUrl;
    const date = req.body.date;

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    let driveId, webContentLinks = [];

    for (let i = 0; i < images.length; i++) {
        try {
            const response = await drive.files.create({
                requestBody: {
                    mimeType: images[i].mimeType,
                    name: images[i].originalname
                },
                media: {
                    mimeType: images[i].mimeType,
                    body: fs.createReadStream(images[i].path)
                }
            });
    
            driveId = response.data.id;
        } catch(err) {
            const error = new Error('Messed up trying to preform google operations.');
            error.statusCode = 500;
            throw error;
        }
    
        try {
            const response = await drive.files.get({
                fileId: driveId,
                mimeType: images[i].mimetype,
                fields: 'webContentLink'
            });
            
            console.log(response.data.webContentLink);
            webContentLinks.push(response.data.webContentLink);
        } catch(err) {
            const error = new Error('Messed up trying to preform google operations.');
            error.statusCode = 500;
            throw error;
        }

        try {
            const response = drive.permissions.create({
                fileId: driveId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
        } catch (err) {
            const error = new Error('Messed up trying to preform google operations.');
            error.statusCode = 500;
            throw error;
        }
    }

    
    const post = new Post(title, content, webContentLinks, videoUrl, date);

    post.save().then(() => {
        console.log('Added');
        for (const image of images) {
            fs.unlink(image.path, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        res.status(201).json({
            message: 'Success'
        });
    }).catch(err => {
        catchHandler(err, next);
    });
}

exports.putEditPost = async (req, res, next) => {
    const errors = validationResult(req);
    validationErrorHandler(errors);

    if (!req.isAdmin) {
        return res.status(401).json({
            message: 'You are not authenticated'
        });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const postId = req.body.id;
    const title = req.body.title;
    const content = req.body.content;
    const date = req.body.date;
    let imageWebContentLinks = [];
    if (req.files) {
        const images = req.files;
        console.log(images[0]);
        
        for (let i = 0; i < images.length; i++) {
            let driveId;
            try {
                const response = await drive.files.create({
                    requestBody: {
                        mimeType: images[i].mimeType,
                        name: images[i].originalname
                    },
                    media: {
                        mimeType: images[i].mimeType,
                        body: fs.createReadStream(images[i].path)
                    }
                });
    
                driveId = response.data.id;
            } catch(err) {
                console.log(err);
            }
    
            try {
                const response = await drive.files.get({
                    fileId: driveId,
                    mimeType: images[i].mimetype,
                    fields: 'webContentLink'
                });
                
                console.log(response.data.webContentLink);
                imageWebContentLinks.push(response.data.webContentLink);
    
                fs.unlink(images[i].path, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            } catch(err) {
                console.log(err);
            }
    
            try {
                const response = await drive.permissions.create({
                    fileId: driveId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone'
                    }
                });
            } catch(err) {
                console.log(err);
            }
        }
    } else {
        imageWebContentLinks = req.body.imageWebContentLinks;
    }
    const videoUrl = req.body.videoUrl;

    const updatedPost = new Post(title, content, imageWebContentLinks, videoUrl, date, postId);

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
        res.status(201).json({
            message: 'Successfully deleted post'
        });
    }).catch((err) => {
        catchHandler(err, next);
    });
}

const catchHandler = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}

const validationErrorHandler = (errors) => {
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
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