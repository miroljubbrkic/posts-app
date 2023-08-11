const Post = require('../models/post')


exports.getPosts = (req, res, next) => {
    const pageSize = req.query.pagesize
    const currenPage = req.query.page
    const postQuery = Post.find()   // ! nece se izvrsiti odmah vec dole kada pozovemo then()
    let fetchedPosts
    
    if(pageSize && currenPage) {
        postQuery
            .skip(pageSize * (currenPage - 1))
            .limit(pageSize)
    }

    postQuery.then(documents => {
        fetchedPosts = documents
        return Post.count()
    }).then(count => {
        res.status(200).json({
            message: 'posts fetched successfully',
            posts: fetchedPosts,
            maxPosts: count
        })
    }).catch(error => {
        res.status(500).json({
            message: 'Fetching posts failed!'
        })
    })
        
    
}

exports.getPost = (req, res, next) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post) {
                res.status(200).json(post)
            } else {
                res.status(404).json({'message': 'Post not found!'})
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Fetching posts failed!'
            })
        })
}

exports.createPost = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host')

    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    })
    post.save()
        .then(createdPost => {
            res.status(201).json({
                message: 'Post added successfully',
                post: {
                    ...createdPost,
                    _id: createdPost._id,
                    
                }
            })
        })
        .catch(error => {
            res.status(500).json({
                message: 'Creating a post failed!'
            })
        })
}


exports.updatePost = (req, res, next) => {
    let imagePath = req.body.imagePath
    if (req.file) {
        const url = req.protocol + '://' + req.get('host')
        imagePath = url + '/images/' + req.file.filename 
    }


    const post = new Post({
        _id: req.body._id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    })
    // console.log(post);
    // * update ce samo onaj post sa zadatim id-em i creatorom
    Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post)
        .then(result => {
            // console.log(result);
            if (result.matchedCount > 0) {
                return res.status(200).json({message: 'Update successful!'})
            }
            res.status(401).json({
                message: 'Not authorized!'
            })
        })
        .catch(error => {
            res.status(500).json({
                message: 'Could not update post!'
            })
        })
}


exports.deletePost = (req, res, next) => {
    Post.deleteOne({_id: req.params.id, creator: req.userData.userId})
        .then(result => {
            // console.log(result);
            if (result.deletedCount > 0) {
                return res.status(200).json({message: 'Deletion successful!'})
            }
            res.status(401).json({
                message: 'Not authorized!'
            })
        })
        .catch(error => {
            res.status(500).json({
                message: 'Fetching post failed!'
            })
        })
}