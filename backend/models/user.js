const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    }
})
// * new hook to chek if it is unique before saving to the db
userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)