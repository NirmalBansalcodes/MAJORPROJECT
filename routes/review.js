const express = require("express");
const router = express.Router({mergeParams: true});
const wrapasync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//Post review route
router.post("/",isLoggedIn, validateReview, wrapasync(reviewController.createReview));

//delete review route

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapasync(reviewController.destroyReview));

module.exports = router;