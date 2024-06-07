
const mongoose = require('mongoose')

  
const bookSchema = new mongoose.Schema( {

    title: {
        type: String,
        required: [true, 'A book must have a title!']
    },
    
    ISBNCode: {
        
        type: Number,
        required: [true, "A book must have a corresponding ISBN Code!"],
        unique: true
    },

    author: {
        type: String,
        required: [true, "A book must have an associated author!"]
    },

    options: {
        beginner: {
            type: Boolean,
            required: [true, "A book must specify if it's beginner-friendly!"]
        },
    
        experiencedTrader: {
            type: Boolean,
            required: [true, "A book must specify if it's for experienced traders!"]
        },
    
        selfHelp: {
            type: Boolean,
            required: [true, "A book must specify if it's for self help!!"]
        }
    },

    link: {
        type: String,
        required: [true, "A book must have a link!"]
    }

})

const Books = mongoose.model('Books', bookSchema)

module.exports = Books