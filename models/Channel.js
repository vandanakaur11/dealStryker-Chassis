const mongoose = require('mongoose')
// const Offer = require('../models/Offer')
const ChannelSchema = mongoose.Schema({
    offerRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
    members: Array,
    buyerName: String,
    dealerName: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 365 * 7
    }, // expires 7 years
    lastActive: Number
})
module.exports = mongoose.model('Channel', ChannelSchema)
