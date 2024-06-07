
const catchAsyncErrors = require('./../utils/catchAsyncErrors')
const Book = require('./../models/bookModel')

exports.getAllBooks = catchAsyncErrors( async (req, res, next) => {

    const books = await Book.find()

    res.status(200).json({
        status: "success",        
        books
    })

})


exports.publishBook = catchAsyncErrors( async (req, res, next) => {

    const book = await Book.create({
        
        title: req.body.title,
        author: req.body.author,
        ISBNCode: req.body.ISBNCode,
        link: req.body.link,
        options: req.body.options,
    })

    res.status(200).json({
        status: "success",
        book
    })

})


exports.deleteBook = catchAsyncErrors( async (req, res, next) => {

    const deletedBook = await Book.findByIdAndDelete(req.params.id)

    res.status(204).json({
        message: "success",
        data: null
    })

})