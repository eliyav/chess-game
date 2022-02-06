const { MongoClient, ObjectId } = require("mongodb");
const { userQueries } = require("./helpers/user-queries");

exports.Mongo = class Mongo {
  constructor() {
    this.client = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  userQueries() {
    return userQueries(this.client);
  }
};
