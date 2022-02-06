//This script will be executed when the user changes their password, the reset email was sent and the user follows the "change password" link. The parameters: email and newPassword are used to confirm the new password.
function changePassword(email, newPassword, callback) {
  const bcrypt = require("bcrypt");
  const MongoClient = require("mongodb@3.1.4").MongoClient;
  const client = new MongoClient("mongodb://user:pass@localhost");

  client.connect(function (err) {
    if (err) return callback(err);

    const db = client.db("db-name");
    const users = db.collection("users");

    bcrypt.hash(newPassword, 10, function (err, hash) {
      if (err) {
        client.close();
        return callback(err);
      }

      users.update(
        { email: email },
        { $set: { password: hash } },
        function (err, count) {
          client.close();
          if (err) return callback(err);
          callback(null, count > 0);
        }
      );
    });
  });
}
