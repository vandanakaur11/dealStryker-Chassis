const mongoose = require("mongoose");

const {Schema} = mongoose;

const OfferSchema = new Schema({
    parentBidId: String,
    dealerId: String,
    members: [String],
    dealerName: String,
    dealershipId: String,
    biddedBy: String,
    price: String,
    address: String,
    isAccepted: Boolean,
    isClosed: Boolean,
    createdAt: Number,
    expire: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 365 * 7
    }
});

const BidSchema = new Schema({
    userId: String,
    name: String,
    manufacturer: String,
    car: String,
    color: String,
    model: String,
    vehicleId: String,
    year: Number,
    financing: String,
    distance: Number,
    zip: Number,
    responses: [String],
    isClosed: Boolean,
    createdAt: Number,
    expire: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 365 * 7
    }, // expires 7 years
});

BidSchema.methods.addOffer = function (offer) {
    this.responses = [
        ...this.responses,
        offer
    ];
};

BidSchema.methods.close = function () {
    this.isClosed = true;
};

OfferSchema.methods.close = function () {
    this.isClosed = true;
};

OfferSchema.methods.accept = function () {
    this.isAccepted = true;
};

OfferSchema.methods.update = function (price) {

    this.price = price;

};

mongoose.model("Offer", OfferSchema);
mongoose.model("Bid", BidSchema);
