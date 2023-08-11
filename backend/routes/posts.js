const express = require('express')
const multer = require('multer')

const checkAuth = require('../middleware/check-auth')
const extractFile = require('../middleware/file')
const PostController = require('../controllers/posts')



const router = express.Router()

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype]
        let error = new Error('Invalid mime type')
        if (isValid) {
            error = null
        }


        // ? ova putanja je relativna u odnosu na server.js
        cb(error, 'backend/images')
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-')
        const extension = MIME_TYPE_MAP[file.mimetype]
        cb(null, name + '-' + Date.now() + '.' + extension)
    }
})

// * ==========================================================================


router.get('', PostController.getPosts)

router.get('/:id', PostController.getPost)

router.post('', checkAuth, extractFile, PostController.createPost)

router.put("/:id", checkAuth,extractFile, PostController.updatePost)

router.delete("/:id", checkAuth, PostController.deletePost)



module.exports = router