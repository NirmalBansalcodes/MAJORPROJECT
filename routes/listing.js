const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
       
       if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, error);
       }else{
        next();
       }
};

//index route
router.get("/", wrapasync(async (req,res) => {
    const allListings = await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    }));

//NEW ROUTE

router.get("/new", (req,res) => {
    res.render("listings/new.ejs");
})


//SHOW ROUTE
router.get("/:id",wrapasync(async (req, res) => {
    let {id} =req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs",{listing});
}));

//CREATE ROUTE

router.post("/",
    validateListing,
    wrapasync(async (req,res,next) => {
       const newListing = new Listing(req.body.listing);
       await newListing.save();
       req.flash("success","New listing Created!");
       res.redirect("/listings");
    })
);

//EDIT ROUTE

router.get("/:id/edit",wrapasync(async (req,res) => {
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
    validateListing,
    wrapasync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE

router.delete("/:id", wrapasync(async (req,res) => {
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