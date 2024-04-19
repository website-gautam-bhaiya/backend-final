
const express = require('express')
const bookController = require('./../controllers/bookController')
const authController = require('./../controllers/authController')

const router = express.Router()

router.get('/all', bookController.getAllBooks)
router.post('/newBook', authController.protect, authController.restrictTo('admin') ,bookController.publishBook)
router.delete('/deleteBook/:id', authController.protect, authController.restrictTo('admin'), bookController.deleteBook)

module.exports = router