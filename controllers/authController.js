const crypto = require('crypto')
const AppError = require('./../utils/AppError')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel');

const catchAsyncErrors = require('./../utils/catchAsyncErrors')
const sendEmail = require('./../utils/email')


const createSendToken = (user, statusCode, res) => {

    const token = signToken(user._id);
    
    const cookieOptions = 
    {
        expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 100,
        httpOnly: true, 
        sameSite: 'strict'
    }

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true
    
    user.password = undefined;
    user.passwordChangedAt = undefined;
    user.__v = undefined;
     
    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
        status: "success",
        user
    })
}


const signToken = id => {

    return jwt.sign( { id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
} 

exports.addAuthor = catchAsyncErrors(async (req, res, next) => {
    

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    })

    
    res.status(200).json({
        status: "success",
        message: "User added succesfully!"
    }) 
})


exports.login = catchAsyncErrors( async (req, res, next) => {
    // 1) Extract email & password from req.body
    
    const { email, password } = req.body
    
  
    // 2) Check if the extracted user exists in the DB.
    
    const user = await User.findOne( { email }).select("+password")
    
    // 3) Check if the user for the corresponding email exists & that the password matches.
    
    if(!user || !await user.correctPassword(password, user.password)) {
        
        return next(new AppError("Incorrect email or password!", 401)) // Code 401 => Unauthorized
    }
    
    // 4) After bypassing the above code: Send JWT
     

    createSendToken(user, 200, res);
    
})


exports.refresh = catchAsyncErrors(async (req, res, next) => {

    // 1) Get JWT from client 

    const token = req.cookies.jwt;

    if(!token) return next()

    // 2) Token Verification : Checking if JWT Payload (ID) is not manipulated!!

    const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decodedJWT.id)
    
    if(!currentUser) {

        return next(new AppError('The user does not exist anymore! Please Sign-Up.', 401))
    }
 
    if(currentUser.changedPasswordAfter(decodedJWT.iat)) {
        return next(new AppError("This user has changed password after login! Please login again to gain access.", 401))
    }

    res.status(200).json({
        message:"Refresh success",
        currentUser
    })
    
})



exports.protect = catchAsyncErrors(async (req, res, next) => {

    // 1) Get JWT from client 
    
    const token = req.cookies.jwt; 
    
    console.log(token);

    if (!token) { 
        return next(new AppError("You are not logged in! Please login to continue.", 401))
    }


    // 2) Token Verification : Checking if JWT Payload (ID) is not manipulated!!

    const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


    // 3) Check if the user still exists after login.

    const currentUser = await User.findById(decodedJWT.id)
    
    if(!currentUser) {

        return next(new AppError('The user does not exist anymore! Please Sign-Up.', 401))
    }
 
    if(currentUser.changedPasswordAfter(decodedJWT.iat)) {
        return next(new AppError("This user has changed password after login! Please login again to gain access.", 401))
    }
    
    // Grant Access
    req.user = currentUser;
    next();

})


exports.forgotPassword = catchAsyncErrors( async (req, res, next) => {

    // 1) GET the user based on the POSTed email from the client.

    const user = await User.findOne( { email : req.body.email })

    if(!user) return next(new AppError('No user exists with the provided email! Please re-enter your mail.', 401))

    // 2) Generate a random reset token (not JWT) for temporarily allowing the user to login which will expire in 10 minutes.

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false})

    const resetURL = `http://localhost:5173/resetPassword/${resetToken}`
    const htmlContent = `
    <div>
        <h1>Forgot your password? Visit: </h1>
        <a href = "${resetURL}" > NiveshKari : Reset Password</a>
        <p>If you didnt forget your password, Ignore this email!</p>
    </div>`
     

    try {

        await sendEmail({
            email: user.email,
            subject: "Your Password Reset Token: (valid for 10 minutes) ",
            html: htmlContent
        })

        res.status(200).json({
            status: "success",
            message: "Email sent! Please check your email."
        })
    }

    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        user.save({validateBeforeSave: false})

        return next(new AppError("There was some problem in sending the email! Please try again.", 500))
    }
  
})


exports.resetPassword = catchAsyncErrors( async (req, res, next) => {


    // 1) Get user based on the token received.

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne( {passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})
    if(!user) return next(new AppError('Token is invalid or has expired!', 401));

    // 2) Update Password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;


    // 3) Remove the passwordResetToken & passwordResetExpires fields after the password is removed!
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();


    // Provide JWT to user after updating password!

    
    createSendToken(user, 200, res);

})


exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    // 1) Find the logged in user and get its password field too for matching (which is hidden usually).
    if(!req.body.password || !req.body.currentPassword || !req.body.passwordConfirm) {
        next(new AppError('Please fill all the fields before submitting!', 400))
    }

    const user = await User.findById(req.user.id).select("+password")
  

    // 2) Check if the entered password mathces.
    if(!await user.correctPassword(req.body.currentPassword, user.password)) return next(new AppError("The password you entered is not your current password! Please try again.", 401))


    // 3) If so, update the password!
    
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();


    //Grant token to user
    const token = signToken(user.id)

    res.status(200).json({
        status: "success", 
    })
})
 


exports.restrictTo = (...roles) => {

    return (req, res, next) => {

        if(!roles.includes(req.user.role)) {
            return next(new AppError('You are not authorized to access this resource! ', 401))
        }

        next();
    }

}

 

exports.logout = catchAsyncErrors( async (req, res, next) => {
  
    res.clearCookie('jwt')

    res.status(200).json({
        status: "success",
        message: "User logged out!"
    })

})