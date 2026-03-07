const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

//index route
router.get("/", wrapasync(listingController.index));

//NEW ROUTE

router.get("/new", isLoggedIn, listingController.renderNewForm);

//SHOW ROUTE
router.get("/:id",wrapasync(listingController.showListing));

//CREATE ROUTE

router.post("/",validateListing,wrapasync(listingController.createListing));

//EDIT ROUTE

router.get("/:id/edit",isLoggedIn,isOwner,wrapasync(listingController.editListing));

//UPDATE ROUTE

router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapasync(listingController.updateListing));

//DELETE ROUTE

router.delete("/:id", isLoggedIn,isOwner,wrapasync(listingController.destroyListing));

module.exports = router;