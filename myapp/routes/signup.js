var bcrypt = require("bcrypt");
var express = require('express');
var router = express.Router();
var isEmail = require('validator/lib/isEmail');

/**
 * @swagger
 * /signup:
 *   post:
 *     tags: [Signup]
 *     summary: Register a new user
 *     description: Register a new user with a name, email, and password
 *     requestBody:
 *      required: true
 *      content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *                 example: Hans Hartz
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *                 example: hans@email.com
 *               password:
 *                 type: string
 *                 description: Password for the user account with a minimum length of 10 characters
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: New user created successfully
 *       400:
 *         description: Bad Request - Missing or invalid input
 */

router.post('/', async function (req, res) {
    if (!req.body.name) {
        res.status(400).json({ message: 'Name is missing' });
        return;
    }
    if (!req.body.password) {
        res.status(400).json({ message: 'Password is missing' });
        return;
    }
    if (!req.body.email) {
        res.status(400).json({ message: 'Email is missing' });
        return;
    }
    if (!isEmail(req.body.email)) {
        res.status(400).json({ message: 'Not a valid Email-Adress' });
        return;
    }
    if (req.body.password.length < 8) {
        res.status(400).json({ message: 'Password to short' });
        return;
    }
    try {
        user = await req.app.locals.User.create(
            {
                name: req.body.name,
                password: bcrypt.hashSync(req.body.password, 8),
                email: req.body.email
            });
        res.status(201).json({ message: 'New User created' });
    } catch (er) {
        res.status(300).json({ message: er.name });
    }
})

module.exports = router;

