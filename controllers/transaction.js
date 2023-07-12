const neo4j = require("neo4j-driver");
const { driver, session } = require("../config/db");

const createTransaction = async (req, res) => {
  const user = req.user;
  console.log("baju", user);
  const userId = user.userId;
  const { name, type, amount, category, description } = req.body;

  const query = `
    MATCH (u:User)
    WHERE elementId(u) = $userId
    CREATE (t:Transaction {name: $name, type: $type, amount: $amount, category: $category, description: $description})-[:BELONGS_TO]->(u)
    RETURN t
  `;

  const params = {
    userId: userId,
    name: name,
    type: type,
    amount: amount,
    category: category,
    description: description,
  };

  try {
    const result = await session.run(query, params);
    const data = result.records[0].get("t");
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

const editTransaction = async (req, res) => {
  const { id } = req.params;
  const transactionId = id;
  const { name, type, amount, category, description } = req.body;

  const query = `
    MATCH (t:Transaction)
    WHERE elementId(t) = $transactionId
    SET t.name = $name, t.type = $type, t.amount = $amount, t.category = $category, t.description = $description
    RETURN t
  `;

  const params = {
    transactionId: transactionId,
    name: name,
    type: type,
    amount: amount,
    category: category,
    description: description,
  };

  try {
    const result = await session.run(query, params);
    const data = result.records[0].get("t");
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const transactionId = id;

  const query = `
    MATCH (t:Transaction)-[r:BELONGS_TO]-(u:User)
    WHERE elementId(t) = $transactionId
    DELETE t, r
  `;

  const params = {
    transactionId: transactionId,
  };

  try {
    await session.run(query, params);
    res.status(200).json("Transaction deleted successfully...");
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

const getTransaction = async (req, res) => {
  const { id } = req.params;
  const transactionId = id;

  const query = `
    MATCH (t:Transaction)
    WHERE elementId(t) = $transactionId
    RETURN t
  `;

  const params = {
    transactionId: transactionId,
  };

  try {
    const result = await session.run(query, params);
    const data = result.records[0].get("t");
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  const user = req.user;
  const userId = user.userId;

  const query = `
    MATCH (t:Transaction)-[:BELONGS_TO]->(u:User)
    WHERE elementId(u) = $userId
    RETURN t
  `;

  const params = {
    userId: userId,
  };

  try {
    const result = await session.run(query, params);
    const data = result.records.map((record) => record.get("t"));
    let sumAmount = 0;
    data?.map(
      (record) => (sumAmount += parseInt(record.properties.amount, 10))
    );
    let walletAmount = sumAmount.toString();
    res.status(200).json({ transactions: data, walletAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

const getFilteredTransactions = async (req, res) => {
  const user = req.user;
  const userId = user.userId;
  const { filters } = req.body;
  const { startDate, endDate, category } = filters;

  let query = `
  MATCH (t:Transaction)-[:BELONGS_TO]->(u:User)
    WHERE elementId(u) = $userId
  `;

  const params = {
    userId: userId,
  };

  if (startDate) {
    query += " AND t.date >= $startDate";
    params.startDate = startDate;
  }

  if (endDate) {
    query += " AND t.date <= $endDate";
    params.endDate = endDate;
  }

  if (category) {
    query += " AND t.category = $category";
    params.category = category;
  }

  query += " RETURN t";

  try {
    const result = await session.run(query, params);
    const data = result.records.map((record) => record.get("t"));
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createTransaction,
  editTransaction,
  deleteTransaction,
  getTransaction,
  getAllTransactions,
  getFilteredTransactions,
  getWalletAmount,
};
