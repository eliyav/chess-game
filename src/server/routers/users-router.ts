import express from "express";
import { User } from "../database/entity/user";
import { UserRepository } from "../database/repositories/user-repository";
import type { SqliteError } from "../database/database-query-types";
import { QueryFailedError } from "typeorm";

const usersRouter = express.Router();

// Get all users
usersRouter.get("/", async (req, res) => {
  try {
    const users = await UserRepository.getUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Create a new user
usersRouter.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("Username, email, and password are required");
  }

  const newUser = new User();
  newUser.username = username;
  newUser.email = email;
  newUser.password = password;

  try {
    const result = await UserRepository.insertUser(newUser);
    console.log("User created:", result);
    if (result.identifiers.length === 0) {
      return res.status(400).send("User could not be created");
    }
    res.status(201).json({
      message: "User created successfully",
      userId: result.identifiers[0].id,
    });
  } catch (error) {
    if (error instanceof QueryFailedError) {
      const sqliteError = error as SqliteError;
      if (sqliteError.driverError.code === "SQLITE_CONSTRAINT") {
        if (sqliteError.driverError.message.includes("username")) {
          return res.status(400).send("Username already exists");
        }
        if (sqliteError.driverError.message.includes("email")) {
          return res.status(400).send("Email already exists");
        }
        return res.status(400).send("Username or email already exists");
      }
    }
    res.status(500).send("Internal Server Error");
  }
});

// Update an existing user
usersRouter.put("/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("Username, email, and password are required");
  }

  try {
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.username = username;
    user.email = email;
    user.password = password;

    const result = await UserRepository.updateUser(user);
    if (result.affected === 0) {
      return res.status(400).send("User could not be updated");
    }
    res.json({
      message: "User updated successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Delete a user
usersRouter.delete("/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const deleteResult = await UserRepository.deleteUser(userId);
    if (deleteResult.affected === 0) {
      return res.status(400).send("User could not be deleted");
    }
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default usersRouter;
