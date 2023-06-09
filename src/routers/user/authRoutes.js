const express = require("express");
const router = express.Router();

const { register, login } = require("../../controllers/user/authController");



router.get("/login", (req, res) => {
  // Handle the home route logic
  res.render("login");
});

router.get("/register", (req, res) => {
  // Handle the home route logic
  res.render("signup");
});


router.post("/register", register);
router.post("/login", login);


module.exports = router;
