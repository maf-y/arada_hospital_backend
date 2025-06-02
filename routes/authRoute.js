const express = require('express');
const router = express.Router();
const { login, auth,logout } = require("../controllers/authController");

router.post('/login', login);
// router.post('/signup', signup);
router.get('/me',auth );
router.post("/logout", logout);

module.exports = router;