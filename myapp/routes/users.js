var express = require('express');
var router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints für Benutzer
 * 
 * /users:
 *   get:
 *     tags: [Users]
 *     security: 
 *         - bearerAuth: []
 *     summary: Liste aller Benutzer
 *     description: Ruft eine Liste aller Benutzer ab
 *     responses:
 *       '200':
 *         description: Erfolgreiche Abfrage
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 *   post:
 *     tags: [Users]
 *     security: 
 *         - bearerAuth: []
 *     summary: Erstellt einen neuen Benutzer
 *     description: Erstellt einen neuen Benutzer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name des Benutzers
 *                 example: Max Mustermann
 *               password:
 *                 type: string
 *                 description: Passwort des Benutzers
 *                 example: mysecretpassword
 *     responses:
 *       '200':
 *         description: Erfolgreiche Erstellung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 *   put:
 *     tags: [Users]
 *     security: 
 *         - bearerAuth: []
 *     summary: Aktualisiert einen Benutzer
 *     description: Aktualisiert einen Benutzer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldName:
 *                 type: string
 *                 description: Alter Name des Benutzers
 *                 example: Max Mustermann
 *               oldPassword:
 *                 type: string
 *                 description: Altes Passwort des Benutzers
 *                 example: mysecretpassword
 *               newName:
 *                 type: string
 *                 description: Neuer Name des Benutzers
 *                 example: Maxi Musterfrau
 *               newPassword:
 *                 type: string
 *                 description: Neues Passwort des Benutzers
 *                 example: newpassword
 *     responses:
 *       '200':
 *         description: Erfolgreiche Aktualisierung
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name des aktualisierten Benutzers
 *                   example: Maxi Musterfrau
 *       '400':
 *         description: Passwort ist nicht korrekt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Fehlermeldung
 */

/* GET users listing. */
router.get('/', async function (req, res) {
  const users = await req.app.locals.User.findAll();
  res.send('hallo');
});
router.post('/', async function (req, res) {
  const user = await req.app.locals.User.create({ name: req.body.name, password: req.body.password });
  res.json(user.name);
});

router.put('/', async function (req, res) {
  const user = await req.app.locals.User.findOne({
    where:
    {
      [Op.and]:
        [{ id: req.body.oldName },
        { password: req.body.oldPassword }]
    }
  })
  if (user !== null) {
    user.set({
      name: req.body.newName,
      password: req.body.newPassword,
    })
    await user.save();
    res.json(user.name);
  } else {
    res.json({ message: 'Password is not correct' })
  }
})

module.exports = router;
