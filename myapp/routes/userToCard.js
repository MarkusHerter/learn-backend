var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /progress:
 *   put:
 *     security: 
 *         - bearerAuth: []
 *     tags: [Progress]
 *     summary: Aktualisiert den Lernfortschritt einer Karte
 *     description: Aktualisiert den Lernfortschritt einer Karte für einen bestimmten Benutzer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CardId:
 *                 type: bigint
 *                 description: ID der Karte, für die der Lernfortschritt aktualisiert werden soll
 *                 example: 1
 *               pocket:
 *                 type: integer
 *                 description: Tasche, in die die Karte verschoben werden soll
 *                 example: 3
 *               lastTimePicked:
 *                  type: bigint
 *                  description: Last time, the card was solved correctly
 *                  example: 1680515529210
 *     responses:
 *       '200':
 *         description: Erfolgreiche Aktualisierung des Lernfortschritts
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Statusmeldung
 *               example: success!
 *       '400':
 *         description: Fehler in den Daten oder Karte existiert nicht für diesen Benutzer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Fehlermeldung
 */

router.put('/', async function (req, res) {
    const pocketInt = parseInt(req.body.pocket);
    if (isNaN(pocketInt) || pocketInt < 0 || pocketInt > 6) {
        res.status(400).send('error in data');
        return;
    }
    try {
        const userToCard = await req.app.locals.UserToCard.findOne({
            where:
            {
                CardId: req.body.cardId,
                UserId: req.app.locals.user.id
            }
        });
        if (userToCard) {
            userToCard.set({
                pocket: req.body.pocket,
                LastTimePicked: req.body.lastTimePicked
            });
            await userToCard.save();
            res.status(200).json({ message: 'success!' });
            return;
        }
        res.status(400).json({ message: 'This card does not exist for this user' });
        return;
    } catch (err) {
        res.status(400).json(err.name);
        return;
    }
});
module.exports = router;
