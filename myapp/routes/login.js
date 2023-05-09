var express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt");
var router = express.Router();
require('dotenv').config();

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Login]
 *     summary: Benutzer-Login
 *     description: Ermöglicht es einem Benutzer, sich über E-Mail und Passwort anzumelden und ein Access-Token zu erhalten
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 required: true
 *                 description: E-Mail-Adresse des Benutzers
 *                 example: hans@email.com
 *               password:
 *                 type: string
 *                 required: true
 *                 description: Passwort des Benutzers
 *                 example: securePassword123
 *     responses:
 *       '200':
 *         description: Erfolgreicher Login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Hans
 *                 accessToken:
 *                   type: string
 *                   description: Access-Token des Benutzers
 *       '403':
 *         description: Benutzer existiert nicht oder Passwort ist falsch
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "User doesn't exist or wrong password"
 */



router.post('/', async function (req, res) {
    {
        try {
            const user = await req.app.locals.User.findOne({
                attributes: ['id', 'name', 'password'],
                where: {
                    email: req.body.email,
                }
            })

            if (user && bcrypt.compareSync(req.body.password, user.password)) {
                user.password = undefined;
                let token = jwt.sign({
                    id: user.id,
                    name: user.name
                },
                    process.env.API_SECRET,
                    {
                        expiresIn: 60 * 60 * 24 // expires in 24 h
                    }
                )
                res.status(200).json({ 'user': user.toJSON(), accessToken: token });
            }
            else {
                res.status(403).send("User doesn't exist or wrong password");
            }
        } catch (err) {
            res.status(400).send(err.name);
            return
        }
    }
});
module.exports = router;