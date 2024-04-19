
 
const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  
    title: {
        type: String,
        required: [true, "An article must have a title!"],
        unique: true
    },

    body: {
        type: String,
        required: [true, "An article must have a body-text!"]
    },

    preview: {
        type: String
    },

    publishedOn: {
        type: Date,
        default: new Date(Date.now()),
        required: [true, "An article must have a publish date!"],
    },

    views: {
        type: Number,
        default: 0
    },
    
    categories: {
        type: String,
        required: [true, "An article must belong to a category!"]
    },

    subCategory: {
        type: String
    },
    
    imageCover: {
        type: String,
        required: [true, "An article must have an image cover!"]
    },

    articleImages: {
        type: [String]
    },

    publishedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        
    }
})
 

articleSchema.pre(/^find/, function(next) {
    
    this.populate({
        path: 'publishedBy',
        select: '-role -__v -passwordChangedAt'
    })
    next();
}) 


const Article = mongoose.model('Article', articleSchema)


module.exports = Article