const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp',{useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("DATABASE CONNECTED");
});

const sample = array => array[Math.floor(Math.random()* array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
   for(let i=0;i<=50;i++)
   {
     const random1000 = Math.floor(Math.random(cities)*1000);
     const price = Math.floor(Math.random()*10) + 10;
     const camp = new Campground({
         location : `${cities[random1000].city}, ${cities[random1000].state}`,
         title : `${sample(descriptors)} ${sample(places)}`,
         image : 'https://source.unsplash.com/collection/483251',
         description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit distinctio, quasi vitae cum suscipit mollitia architecto perspiciatis optio corrupti doloremque ipsam vel alias, consequatur nulla? Quam esse repellat mollitia dolorum?',
         price 
     })
     await camp.save();
   }
}

seedDB()
.then(() => {
    mongoose.connection.close();
})

