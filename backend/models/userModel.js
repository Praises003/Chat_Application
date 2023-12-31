const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    email: { 
        type: String, 
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, 
    picture: {
        type: String,
        required: true,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" 
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }

}, {
    timestamps: true
})


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.validatePassword = async function(inputPassword) {
    return await bcrypt.compare(inputPassword, this.password)
}

const User = mongoose.model("User", userSchema)

module.exports = User