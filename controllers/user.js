const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../utils/jwtToken");

const { neo4j, driver, session } = require("../config/db");

// Register User
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const checkQuery = `
    MATCH (u:User { email: $email })
    RETURN u
  `;

  const checkParams = {
    email: email,
  };

  const createQuery = `
    CREATE (u:User { firstName: $firstName, lastName: $lastName, email: $email, password: $password })
    RETURN u, elementId(u) AS userId
  `;

  const createParams = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hashedPassword,
  };

  try {
    const checkResult = await session.run(checkQuery, checkParams);
    if (checkResult.records.length > 0) {
      return res.status(409).json({ msg: "User already exists" });
    }

    const createResult = await session.run(createQuery, createParams);
    const data = createResult.records[0].get("u");
    const userId = createResult.records[0].get("userId");
    const token = generateToken(userId);
    const resData = {
      firstName: data?.properties?.firstName,
      lastName: data?.properties?.lastName,
      email: data?.properties?.email,
      token: token,
    };

    res.status(200).json(resData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const query = `
    MATCH (u:User { email: $email })
    RETURN u, u.password AS password, elementId(u) AS userId
  `;

  const params = {
    email: email,
  };
  try {
    const result = await session.run(query, params);

    if (result.records.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    const hashedPassword = result.records[0].get("password");

    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return res.status(409).json({ msg: "Invalid password" });
    }
    const userId = result.records[0].get("userId");
    // console.log("userId", userId)

    const token = generateToken(userId);
    const data = result.records[0].get("u");
    const resData = {
      firstName: data?.properties?.firstName,
      lastName: data?.properties?.lastName,
      email: data?.properties?.email,
      token: token,
    };

    res.status(200).json(resData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

// Logout User (not storing session state, so simply a placeholder)
function logoutUser() {
  console.log("User logged out.");
}

const getAllUsers = async (req, res) => {
  const query = `
    MATCH (u:User)
    RETURN u
  `;

  try {
    const result = await session.run(query);
    const users = result.records.map((record) => record.get("u"));
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { registerUser, loginUser, getAllUsers };
