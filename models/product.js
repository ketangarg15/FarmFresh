const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    // CORRECTED: Image is now an object for cloud storage
    image: {
        url: String,
        filename: String
    },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    category: String,
    location: String,
    farmer: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ]
});

// This middleware correctly deletes associated reviews when a product is deleted
productSchema.post("findOneAndDelete", async (product) => {
    if (product && product.reviews.length) {
        await Review.deleteMany({ _id: { $in: product.reviews } });
    }
});

module.exports = mongoose.model("Product", productSchema);