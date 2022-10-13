const mongoose = require("mongoose");

const VerifyCodesSchema = mongoose.Schema({
  code: Number,
  email: String,
  createdAt: { type: Date, expires: 3600, default: Date.now }, // expires 1 hour
});

module.exports = mongoose.model("VerifyCodes", VerifyCodesSchema);
