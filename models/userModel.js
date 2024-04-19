const crypto = require('crypto')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter your name!"]
    },

    email: {
        type: String,
        required: [true, "Please provide an email!"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid e-mail!"]
    },

    password: {
        type: String,
        required: [true, "Please provide a password!"],
        select: false
    },

    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password!"],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: "Passwords do not match!"
        }
    },
    role: {
        type: String,
        enums: ['admin', 'author'],
        default: "author"
    },
    profilePhoto: { 
        type: String,
        default: 'placeholder.jpg'
    },
    passwordChangedAt : Date,
    passwordResetToken: String,
    passwordResetExpires: Date 

})

userSchema.pre(/^find/, function (next) {

    this.select('-__v -passwordChangedAt -passwordResetExpires -passwordResetToken')
    next();
})

userSchema.pre('save', function(next) { 
    if (!this.isModified('password') || this.isNew ) return next();
    this.passwordChangedAt = Date.now() - 1000                  // Subtracting 1 second in the rare case if the JWT is issued a few ms before passwordChangedAt is updated due to some reasons.
    next();
})


userSchema.pre('save', async function (next) {

    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined;
    next();
})


userSchema.methods.correctPassword = async function( enteredPassword, userPassword) {

    return await bcrypt.compare(enteredPassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) { //JWTTimestamp refers to the time (in ms) at which the JWT was issued to the user.
 
    if (this.passwordChangedAt) {                                   //if this.passwordChangedAt yields a falsy value, it means that the passwordChangedAt field doesn't exist and the password is never changed.
         

        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10) //Converting passwordChangedAt.getTime() to ms.

        /* If this returns true, it means that the JWT was issued before the password was changed. 
        Hence error must be thrown since it could mean that someone else could've accessed the JWT 
        and then changed the password from stopping the original user's access. Hence, proper 
        measures should be taken to prevent such a scenario.  */

        return JWTTimestamp < changedTimestamp
    }

    //False means the password is not changed.
    return false 
}

userSchema.methods.createPasswordResetToken = function() {

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + ( 10 * 60 * 1000);
    
    return resetToken

}


const User = mongoose.model('User', userSchema);

module.exports = User;