const bcrypt = require("bcrypt");

exports.userQueries = function userQueries(client) {
  //This script will be executed each time a user attempts to login. The two parameters: email and password, are used to validate the authenticity of the user.
  function login(email, password, callback) {
    client.connect(function (err) {
      if (err) return callback(err);

      const db = client.db("chess-game-data");
      const users = db.collection("users");

      users.findOne({ email: email }, function (err, user) {
        if (err || !user) {
          client.close();
          return callback(err || new WrongUsernameOrPasswordError(email));
        }

        bcrypt.compare(password, user.password, function (err, isValid) {
          client.close();

          if (err || !isValid)
            return callback(err || new WrongUsernameOrPasswordError(email));

          return callback(null, {
            user_id: user._id.toString(),
            nickname: user.nickname,
            email: user.email,
          });
        });
      });
    });
  }

  //This script will be executed after a user that signed-up, and follows the "verification" link. The parameter: email is used to verify an account.
  function verify(email, callback) {
    client.connect(function (err) {
      if (err) return callback(err);

      const db = client.db("db-name");
      const users = db.collection("users");
      const query = { email: email, email_verified: false };

      users.update(
        query,
        { $set: { email_verified: true } },
        function (err, count) {
          client.close();

          if (err) return callback(err);
          callback(null, count > 0);
        }
      );
    });
  }

  //This script will be executed when the user changes their password to test if the user exists.
  function getByEmail(email, callback) {
    client.connect(function (err) {
      if (err) return callback(err);

      const db = client.db("chess-game-data");
      const users = db.collection("users");

      users.findOne({ email: email }, function (err, user) {
        client.close();

        if (err) return callback(err);
        if (!user) return callback(null, null);

        return callback(null, {
          user_id: user._id.toString(),
          nickname: user.nickname,
          email: user.email,
        });
      });
    });
  }

  //This script will be executed when a user is deleted.
  function remove(id, callback) {
    client.connect(function (err) {
      if (err) return callback(err);

      const db = client.db("db-name");
      const users = db.collection("users");

      users.remove({ email: id }, function (err) {
        client.close();

        if (err) return callback(err);
        callback(null);
      });
    });
  }

  //This script will be executed when the user signs up. The parameters: user.email and user.password, are used to create a record in the user store.
  function create(user, callback) {
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

  //This script will be executed when the user changes their password, the reset email was sent and the user follows the "change password" link. The parameters: email and newPassword are used to confirm the new password.
  function changePassword(email, newPassword, callback) {
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

  return { changePassword, create, getByEmail, login, remove, verify };
};
