const jwt = require('jsonwebtoken')

// ! middlewares are just funtions
module.exports = (req, res, next) => {

    try {
        // * token obicno pocinje da 'Bearer randomTokenasdfasdfasdf'
        const token = req.headers.authorization.split(" ")[1]
        const decodedToken = jwt.verify(token, process.env.JWT_KEY)
        req.userData = {email: decodedToken.email, userId: decodedToken.userId}
        next()

    } catch (error) {
        res.status(401).json({message: 'You are not authenticated!'})
    }
    



}