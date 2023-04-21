var express = require('express');
var router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID der Karte
 *           example: 1
 *         front:
 *           type: string
 *           description: Vorderseite der Karte
 *           example: Hund
 *         back:
 *           type: string
 *           description: Rückseite der Karte
 *           example: Dog
 *         BoxId:
 *           type: integer
 *           description: ID der Box, zu der die Karte gehört
 *           example: 1
 *         pocket:
 *           type: integer
 *           description: Anzahl der Male, die die Karte ausgewählt wurde
 *           example: 0
 *         lastTimePicked:
 *           type: integer
 *           format: date-time
 *           description: Zeitpunkt der letzten Auswahl der Karte
 *           example: 1680515529210
 * tags:
 *  name: Cards
 */

/**
 * @swagger
 * /cards:
 *   get:
 *     security: 
 *         - bearerAuth: []
 *     tags: [Cards]
 *     summary: Liste aller Karten in einer Box
 *     description: Ruft eine Liste aller Karten in einer Box ab
 *     parameters:
 *       - in: query
 *         name: boxId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID der Box, für die die Karten abgerufen werden sollen
 *         example: 1
 *     responses:
 *       '200':
 *         description: Erfolgreiche Abfrage
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Card'
 *   post:
 *     tags: [Cards]
 *     security: 
 *         - bearerAuth: []
 *     summary: Erstellt eine neue Karte in einer Box
 *     description: Erstellt eine neue Karte in einer Box
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               boxId:
 *                 type: integer
 *                 description: ID der Box, zu der die Karte hinzugefügt werden soll
 *                 example: 1
 *               front:
 *                 type: string
 *                 description: Vorderseite der Karte
 *                 example: Hund
 *               back:
 *                 type: string
 *                 description: Rückseite der Karte
 *                 example: Dog
 *     responses:
 *       '200':
 *         description: Erfolgreiche Erstellung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       '403':
 *         description: Keine Berechtigung zum Hinzufügen der Karte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No permission for this action'
 *   put:
 *     tags: ["Cards"]
 *     security: 
 *         - bearerAuth: []
 *     summary: Aktualisiert eine Karte in einer Box
 *     description: Aktualisiert eine Karte in einer Box
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardId:
 *                 type: integer
 *                 description: ID der Karte, die aktualisiert werden soll
 *                 example: 1
 *               front:
 *                 type: string
 *                 description: Vorderseite der Karte
 *                 example: Hund
 *               back:
 *                 type: string
 *                 description: Rückseite der Karte
 *                 example: Dog
 *     responses:
 *       '200':
 *         description: Erfolgreiche Aktualisierung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       '400':
 *         description: Card id does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Card id does not exist'
 *       '403':
 *         description: Keine Berechtigung zum Aktualisieren der Karte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No permission for this action'
 */

router.get('/', async function (req, res) {
    try {
        const cards = await req.app.locals.user.getCards({
            joinTableAttributes: ['pocket', 'lastTimePicked'],
            where: { BoxId: req.query.boxId },
        })
        const payload = JSON.parse(JSON.stringify(cards)).map(item => {
            return {
                'id': item.id,
                'front': item.front,
                'back': item.back,
                'BoxId': item.BoxId,
                'pocket': item.UserToCard.pocket,
                'lastTimePicked': item.UserToCard.lastTimePicked
            }
        })
        res.status(200).json(payload);
    } catch (err) {
        res.status(400).send("message: " + err)
    }
})

async function checkBoxPermission(user, boxId, action, res) {
    const box = await user.getBoxes({ where: { id: boxId } });
    if (!box[0]) {
        res.status(403).send('kein Zugriff auf die Box');
        return false
    }
    if (!box[0].UserToBox.rights.includes(action)) {
        res.status(403).send('No permission for this action');
        return false
    }
    return true
}


router.post('/', async function (req, res) {
    if (await checkBoxPermission(req.app.locals.user, req.body.boxId, 'w', res)) {
        try {
            const card = await req.app.locals.Card.create({
                front: req.body.front,
                back: req.body.back,
                BoxId: req.body.boxId,
            })
            await req.app.locals.UserToCard.create({
                pocket: 0,
                lastTimePicked: 0,
                CardId: card.id,
                UserId: req.app.locals.user.id
            })
            const payload = { ...card.dataValues, pocket: 0, lastTimePicked: 0 };
            res.status(200).json(payload);
        } catch (err) {
            res.status(400).json({ message: err.name });
        }
    }
})

router.put('/', async function (req, res) {
    const card = await req.app.locals.Card.findOne({ where: { id: req.body.cardId } });
    if (!card) {
        res.status(400).send('Card id does not exist');
        return
    }
    if (await checkBoxPermission(req.app.locals.user, card.BoxId, 'd', res)) {
        try {
            card.set({
                front: req.body.front,
                back: req.body.back
            })
            await card.save();
            const userToCard = await req.app.locals.UserToCard.findOne({ where: { CardId: req.body.cardId } });
            userToCard.pocket = 0;
            await userToCard.save();
            const payload = { ...card.dataValues, pocket: 0, lastTimePicket: userToCard.lastTimePicked }
            res.status(200).json(payload);
        } catch (err) {
            res.status(400).json(err.name)
        }
    }

});

router.delete('/', async function (req, res) {
    const card = await req.app.locals.Card.findOne({ where: { id: req.body.cardId } });
    if (!card) {
        res.status.apply(400).send('Card id does not exist');
        return
    }
    if (await checkBoxPermission(req.app.locals.user, card.BoxId, 'd', res)) {
        card.destroy();
        res.status(400).send('success!');
        return;
    }
})

module.exports = router;