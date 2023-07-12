const express = require('express');
const {authenticate} = require('../middleware/authMiddleware')
const {
    createTransaction,
    editTransaction,
    deleteTransaction,
    getTransaction,
    getAllTransactions,
    getFilteredTransactions,
    getWalletAmount
} = require('../controllers/transaction');

const router = express.Router()

router.post("/create", authenticate, createTransaction)
router.get("/", authenticate, getAllTransactions)
router.get("/:id", authenticate, getTransaction)
router.put("/:id", authenticate, editTransaction)
router.delete("/:id", authenticate, deleteTransaction)
// router.post("/login", loginUser)

module.exports = router