const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campgrounds');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./joiSchema');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{useNewUrlParser: true, useUnifiedTopology: true})

const app = express();

app.set('views',path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.engine('ejs',ejsMate)
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended: true}))


const validateCampground = (req,res, next) =>{
    const {error}  = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
     throw new ExpressError(msg,400)
    }
     else{
         next();
     }
}

const validateReview = (req,res , next) => {
    const {error}  = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
     throw new ExpressError(msg,400)
    }
     else{
         next();
     }
}

app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/campgrounds', catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))

app.get('/campgrounds/new', (req,res)=>{
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req,res)=>{
  //  if(!req.body.campground) throw new ExpressError('Incomplete Campground Data',400)
    
    const campground =  Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}))

app.get('/campgrounds/:id', catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
   res.render('campgrounds/show',{campground});
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id)
   res.render('campgrounds/edit',{campground});
}))

app.put('/campgrounds/:id', validateCampground,catchAsync( async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground});
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync( async (req,res)=>{
    const {id} = req.params;
    const deleteCampground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', validateReview , catchAsync(async ( req,res) =>{
   const campground =  await Campground.findById(req.params.id);
   const review = new Review(req.body.review);
   campground.reviews.push(review);
   await review.save();
   await campground.save();
   res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId' , catchAsync( async(req,res)=>{
   const {id, reviewId} = req.params;
   await Campground.findByIdAndUpdate(id, { $pull : {reviews : reviewId} });
   await Review.findByIdAndDelete(reviewId);
   res.redirect(`/campgrounds/${id}`);
}))

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found', 404))
})

app.use((err , req, res, next)=>{
    const {statusCode = 500 } = err;
    if(!err.message) err.message = "Oh No, Something went wrong!"
     res.status(statusCode).render('error', {err});
})

app.listen(3000, ()=>{
    console.log('Serving the application on port 3000')
})