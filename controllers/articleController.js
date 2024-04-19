 
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const Article = require('./../models/articleModel')
const path = require('path')
const fs = require('fs'); 
const AppError = require('../utils/AppError');

exports.getArticlesByCategory = catchAsyncErrors( async (req, res, next) => {

    const category = req.params.cat.split('-').map(i => i.charAt(0).toUpperCase() + i.substring(1,i.length)).join(' ')
    const articles = await Article.find({categories: category})

    res.status(200).json({
        status: "success",
        results: articles.length,
        data: {
            articles
        }
    })
})

exports.getTopMostViewed = catchAsyncErrors( async (req, res, next) => {

    const articles = await Article.find().sort('-views -publishedOn').limit(5)
    res.status(200).json({
        status: "success",
        data: {
            articles
        }
    })
})

exports.getAllArticles = catchAsyncErrors(async (req, res, next) => {

    let articles = await Article.find(); 
 
    
    res.status(200).json({
        status: "success",
        results: articles.length,
        articles
    })
})

exports.getArticle =  catchAsyncErrors(async (req, res, next) => {
    
    const article = await Article.findById(req.params.id)
    article.views++;
    await article.save(); 
      
    res.status(200).json({
        status: "success",
        data: {
            article
        }
    }) 
})
 

exports.createNewArticle =  catchAsyncErrors(async (req, res, next) => { 

    req.body.publishedBy = req.user.id
    req.body.articleImages = []
    
    for(let i = 0; i < req.files.length; i++)
    {
        req.body.articleImages.push(req.files[i].filename)
    }
    
    const newArticle = await Article.create(req.body);
    
    res.status(200).json({
        status: "success",
        data: newArticle
    })
})



exports.getFrontPageArticles = catchAsyncErrors(async (req, res, next) => {

    const articles = await Article.find().sort('-publishedOn').limit(15);

    res.status(200).json({
        message: 'success',
        results: articles.length,
        articles
    })
})

 

exports.updateArticle = catchAsyncErrors(async (req, res, next) => {

    let checked = false
    const published = await Article.find({publishedBy : req.user._id})
    published.forEach( article => { 

        if (article._id.toString() === req.params.id) checked = true
        
    })

    if(!checked) return next(new AppError('You are not authorized to remove this article. Please log-in with the proper credentials!', 401))

    
    const updatedArticle = await Article.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: false
    }) 

    

    res.status(200).json({
        status: "success",
        data: {
            updatedArticle
        }
    })
    
})

exports.deleteArticle = catchAsyncErrors(async (req, res, next) => {


    const deletedArticle = await Article.findByIdAndDelete(req.params.id)
 
    deletedArticle.articleImages.forEach( img => {
        
        if (fs.existsSync(path.join(path.resolve(__dirname, ".."), 'public', 'articleImages', img))) {
            fs.unlink(path.join(path.resolve(__dirname, ".."), 'public', 'articleImages', img), (err) => {

                if (err) {
                    res.status(500).json({
                        status: "error",
                        message: "Error in removing article!"

                    })
                }

                else {
                    res.status(204).json({
                        status: "success",
                        data: null
                    }) 
    
                }
            }) 
        }
    }) 
})


exports.getArticlesPublishedBy = catchAsyncErrors( async (req, res, next) => {

    const userId = (req.params.userId)
    
    const articles = await Article.find({publishedBy: userId })

    res.status(200).json({
        results: articles.length,
        articles
    })

    
})