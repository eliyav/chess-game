//This script will be executed each time a user attempts to login. The two parameters: email and password, are used to validate the authenticity of the user.
function login(email, password, client, callback) {
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
