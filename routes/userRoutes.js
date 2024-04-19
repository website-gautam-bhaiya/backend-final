
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')
const userController = require('./../controllers/userController')

// Implement LogIn for authors
// Implement User Route Protection (by using restrictTo() and protect() middlewares):   1) Protect User operations => POST, UPDATE, DELETE to Admin.
//                                                                                      2) UPDATE-ing & DELETE-ing Self Account for Author & Admin.
//                                                                                      3) Restrict POSTing New Article to Authors.
//                                                                                      4) No Route Protection for GETting news.


router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)

router.patch('/updateMyPassword', authController.protect, authController.updatePassword)
router.patch('/updateMyAccount', authController.protect, userController.updateMyAccount)
router.get('/getAllAuthors', authController.protect, authController.restrictTo('admin'), userController.getAllUsers)
router.delete('/deleteAuthor/:id', authController.protect, authController.restrictTo('admin'), userController.deleteUser)

// Only an admin can add an author to the DB.
router.post('/addAuthor', authController.protect, authController.restrictTo('admin'), authController.addAuthor)
router.post('/login', authController.login)

router.get('/logout', authController.protect, authController.logout)
router.get('/refresh', authController.refresh)

router.get('/myAccount', authController.protect, userController.getMyAccountDetails)

module.exports = router