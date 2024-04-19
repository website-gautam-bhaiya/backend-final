
const AppError = require('../utils/AppError')
const { login } = require('./authController')

const sendErrorDev = (err, res) => { 
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {

    // Errors that we are aware of, and are trusted to send to the users.
    
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err
        })
    }

    // Errors that are unknown, don't want them to be leaked to the users.

    else {
        
        res.status(err.statusCode).json({
            status: 'error',
            message: 'Something went wrong!'
        })
    }
 
}

const handleValidationErrorDB = err => {

    const message = `${Object.values(err.errors).map(el => el.message).join('. ')}`   
    return new AppError(message, 400)
}

const handleDuplicateErrorDB = err => {
    const duplicatedFields = Object.keys(err.keyPattern)
    return new AppError(`${duplicatedFields[0]} already exists!  Please enter a different value.`, 400)
}

module.exports = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {

        sendErrorDev(err, res)
    }

    else if (process.env.NODE_ENV === "production") {
        
        let error = {...err, message: err.message} 
        if(err.name === "ValidationError") error = handleValidationErrorDB(error)
        if(err.code === 11000) error = handleDuplicateErrorDB(error)
        sendErrorProd(error, res)
    }
}