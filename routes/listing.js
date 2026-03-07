const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

//index route
router.get("/", wrapasync(async (req,res) => {
    const allListings = await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    }));

//NEW ROUTE

router.get("/new", isLoggedIn, (req,res) => {
    res.render("listings/new.ejs");
})


//SHOW ROUTE
router.get("/:id",wrapasync(async (req, res) => {
    let {id} =req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}));

//CREATE ROUTE

router.post("/",
    validateListing,
    wrapasync(async (req,res,next) => {
       const newListing = new Listing(req.body.listing);
       newListing.owner = req.user._id;
       await newListing.save();
       req.flash("success","New listing Created!");
       res.redirect("/listings");
    })
);

//EDIT ROUTE

router.get("/:id/edit",isLoggedIn,isOwner,wrapasync(async (req,res) => {
    let {id} =req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

//UPDATE ROUTE

router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapasync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE

router.delete("/:id", isLoggedIn,isOwner,wrapasync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash("error", "Listing already deleted!");
        return res.redirect("/listings");
    }
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    return res.redirect("/listings");
}));

module.exports = router;