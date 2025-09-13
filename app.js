const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

//index route
app.get("/listings", async (req,res) => {
    const allListings = await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    });

//NEW ROUTE

app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
})


//SHOW ROUTE
app.get("/listings/:id", async (req, res) => {
    let {id} =req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

//CREATE ROUTE

app.post("/listings",async (req,res) => {
    
   const newListing = new Listing(req.body.listing);
   await newListing.save();
    res.redirect("/listings");
});

//EDIT ROUTE

app.get("/listings/:id/edit",async (req,res) => {
    let {id} =req.params;
    const listing = await Listing.findById(id);
    res.render("lisitngs/edit.ejs",{listing});
})

// app.get("/testListing", async (req,res) =>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});