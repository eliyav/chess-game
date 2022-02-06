//This script will be executed when the user signs up. The parameters: user.email and user.password, are used to create a record in the user store.
function create(user, client, callback) {
  client.connect(function (err) {
    if (err) return callback(err);

    const db = client.db("chess-game-data");
    const users = db.collection("users");

    users.findOne({ email: user.email }, function (err, withSameMail) {
      if (err || withSameMail) {
        client.close();
        return callback(err || new Error("the user already exists"));
      }

      bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
          client.close();
          return callback(err);
        }

        user.password = hash;
        users.insertOne(user, function (err, inserted) {
          client.close();

          if (err) return callback(err);
          callback(null);
        });
      });
    });
  });
}
