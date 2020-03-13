const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true 
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    settings: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'settings'
    }
})

module.exports = User = mongoose.model('User', userSchema)