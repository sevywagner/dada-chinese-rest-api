const Post = require('./../models/post');

exports.getPosts = (req, res, next) => {
    Post.fetchAll().then((posts) => {
        res.status(200).json({
            posts: posts
        });
    }).catch(err => console.log());
}

exports.postCreatePost = (req, res, next) => {
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
    }).catch(err => console.log(err));
}

exports.postEditPost = (req, res, next) => {
    const postId = req.body.id;
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;
    const date = req.body.date;
    
    const updatedPost = new Post(title, content, imageUrl, date, postId);

    updatedPost.update().then((result) => {
        console.log('Updated');
        res.status(201).json({
            message: 'Post updated'
        });
    }).catch((err) => {
        console.log(err);
        res.status(400).json({
            message: 'Update failed'
        });
    });
}