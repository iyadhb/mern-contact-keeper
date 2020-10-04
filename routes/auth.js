const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { body, validationResult, check } = require('express-validator');

const User = require('../models/User');
const { request } = require('express');

// @route   POST api/auth
//@desc     Get Logged in user
//@access   Private
router.get('/', (req, res) => {
  res.send('Get Logged in user');
});

// @route   POST api/auth
//@desc     Auth user & get token
//@access   Public
router.post(
  '/',
  [
    check('email', 'Please include a vilid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credintials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credintials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
