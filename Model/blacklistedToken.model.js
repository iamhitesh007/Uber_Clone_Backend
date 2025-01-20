import mongoose from "mongoose";

const blackListedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400,
  },
});

const BlackListedTokenModel = mongoose.model(
  "blackListedToken",
  blackListedTokenSchema
);

export default BlackListedTokenModel;
