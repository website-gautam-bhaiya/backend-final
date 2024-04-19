
const express = require('express')
 

const authController = require('./../controllers/authController')
const articleController = require('../controllers/articleController')
const upload = require('./../upload')

const router = express.Router();

router.post('/', authController.protect, upload.array('articleImages'), articleController.createNewArticle )

router.route('/frontPageNews').get(articleController.getFrontPageArticles)
router.route('/category/:cat').get(  articleController.getArticlesByCategory)
router.route('/publishedBy/:userId').get(articleController.getArticlesPublishedBy)
router.route('/nivesh-top').get(articleController.getTopMostViewed)

router.route('/').get(articleController.getAllArticles)
router.route('/:id').get( articleController.getArticle).patch(authController.protect, articleController.updateArticle).delete(authController.protect, articleController.deleteArticle)
 
module.exports = router