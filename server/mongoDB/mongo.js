const { MongoClient, ObjectId } = require("mongodb");

exports.Mongo = class Mongo {
  constructor() {
    this.client = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async createUser(user) {
    const connected = await this.client.connect();
    const newUser = await connected
      .db("chess-game-data")
      .collection("users")
      .insertOne({
        name: user.name,
        email: user.email,
        sub: user.sub,
        created: new Date(user.created),
        lastLogin: new Date(user.lastLogin),
        picture: user.picture,
      });
    return newUser;
  }

  async findUser(findBy) {
    const connected = await this.client.connect();
    const user = await connected
      .db("chess-game-data")
      .collection("users")
      .findOne(findBy);
    return user ? user : false;
  }
};
