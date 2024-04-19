 
const catchAsyncErrors = require('./../utils/catchAsyncErrors')
const fs = require('fs')
const path = require('path')
const User = require('./../models/userModel')
const Article = require('./../models/articleModel')

const filterObjProperties = (obj, ...allowedProperties) => {

    const newObj = {}
    Object.keys(obj).map(property => {
        if(allowedProperties.includes(obj)) {
            newObj[property] = obj[property]
        }
    })

    return obj

} 


exports.getUser =  (req, res) => {

    res.status(500).json({
        status: "Error",
        message: 'Route not implemented yet!'
    })
}

exports.updateUser =  (req, res) => {

    res.status(500).json({
        status: "Error",
        message: 'Route not implemented yet!'
    })
}

exports.deleteUser =  catchAsyncErrors( async (req, res, next) => {
  
    const articles = await Article.find( { publishedBy: req.params.id } )
    articles.forEach(article => article.articleImages.forEach( img => {
        
        if (fs.existsSync(path.join(path.resolve(__dirname, ".."), 'public', 'articleImages', img))) {
            fs.unlink(path.join(path.resolve(__dirname, ".."), 'public', 'articleImages', img), (err) => {

                if (err) {
                    res.status(500).json({
                        status: "error",
                        message: "Error in removing article!"

                    })
                } 
            }) 
        }
    }) )

    const deletedArticles = await Article.deleteMany( { publishedBy: req.params.id } )
    const user  = await User.findByIdAndDelete(req.params.id)
 

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.createUser =  (req, res) => {

    res.status(500).json({
        status: "Error",
        message: 'Route not implemented yet!'
    })
}


exports.getAllUsers = catchAsyncErrors( async(req, res, next) => {

    const users = await User.find( {role :'author'})

    res.status(200).json({
        status: "success",
        results: users.length,
        users
    })
})



exports.updateMyAccount = catchAsyncErrors(async (req, res, next) => {

    if(req.body.password || req.body.passwordConfirm) return next(new AppError('You cannot update your password from here! Please use the specified route.', 400))


    // 1) Filtering the req.body for only the properties we want so the client cannot POST malicious or incorrect Data in DB.
    const filteredObj = filterObjProperties(req.body, "name", "email");

    const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
})
 
exports.getMyAccountDetails = catchAsyncErrors( async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password +passwordChangedAt")

    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
})