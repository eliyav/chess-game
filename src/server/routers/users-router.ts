import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../database/repositories/user-repository";

const usersRouter = express.Router();

// Get all users
usersRouter.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
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

  try {
    const result = await createUser({
      username,
      email,
      password,
    });
    console.log("User created:", result);
    res.status(201).json({
      message: "User created successfully",
      userId: result.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "SqliteError") {
        if (error.message.includes("user.username")) {
          return res.status(400).send("Username already exists");
        }
        if (error.message.includes("user.email")) {
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
    const user = await updateUser(userId, {
      username,
      email,
      password,
    });
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
    const user = await deleteUser(userId);
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default usersRouter;
