const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
//  Making a connection
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({}); // if there is data already exits then delete all data initially
  initData.data = initData.data.map((obj) => ({ ...obj, owner: "67f0f7e485ccdef831811bc1" }));
  await Listing.insertMany(initData.data); // then insert all data clearly from the data.js file
  console.log("data was initialized");
};
initDB();
