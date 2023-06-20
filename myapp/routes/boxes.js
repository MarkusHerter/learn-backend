var express = require('express');
var router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Box:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID der Box
 *           example: 1
 *         name:
 *           type: string
 *           description: Name der Box
 *           example: Box 1
 *         creatorId:
 *           type: integer
 *           description: ID des Erstellers der Box
 *           example: 1
 *         creator:
 *           type: string
 *           description: Name des Erstellers der Box
 *           example: Max Mustermann
 *         rights:
 *           type: string
 *           description: Rechte des Benutzers für die Box (z.B. "rwd" für read, write, delete)
 *           example: rwd
 *     FullBox:
 *       type: object
 *       required:
 *         - name
 *         - cards
 *       properties:
 *         name:
 *           type: string
 *           description: Name der Box
 *           example: Spanisch
 *         cards:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: string
 *           example: [["Hund", "dog"], ["Katze", "cat"]]
 *     CardShort:
 *       type: object
 *       properties:
 *         id:
 *           type: null
 *           example: 'null'
 *         front:
 *           type: string
 *           example: 'Hund'
 *         back:
 *           type: string
 *           example: 'dog'
 *         BoxId:
 *           type: integer
 *           example: 39
 * tags:
 *   name: Boxes
 */

/**
 * @swagger
 * /boxes:
 *   get:
 *     security: 
 *         - bearerAuth: []
 *     summary: Liste aller Boxen
 *     tags: [Boxes]
 *     description: Ruft eine Liste aller Boxen ab
 *     responses:
 *       '200':
 *         description: Erfolgreiche Abfrage
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Box'
 */

router.get('/', async function (req, res, next) {
    const boxes = await req.app.locals.user.getBoxes({
        joinTableAttributes: ['rights'], include: [{
            model: req.app.locals.User,
            as: 'creator',
            attributes: ['name']
        }]
    });
    const payload = boxes.map(item => {
        return {
            'id': item.id,
            'name': item.name,
            'creatorId': item.creatorId,
            'creator': item.creator ? item.creator.name : null,
            'rights': item.UserToBox ? item.UserToBox.rights : null
        }
    })
    res.status(200).json(payload);
});

/**
 * @swagger
 * /boxes/bulk:
 *   post:
 *     security:
 *         - bearerAuth: []
 *     tags: [Boxes]
 *     summary: Erstellt eine Box mit mehreren Karten
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FullBox'
 *     responses:
 *       '200':
 *         description: Erfolgreiche Erstellung
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: name
 *                 doublettes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CardShort'
 *       '400':
 *         description: Ungültiger Name
 *       '403':
 *         description: Keine Berechtigung für diese Aktion
 */

router.post('/bulk', async function (req, res, next) {
    // try {
    const newName = req.body.name.trim();

    if (newName === "") {
        res.status(400).send("Ungültiger Name");
        return
    }
    const [box, created] = await req.app.locals.Box.findOrCreate({ where: { name: newName, creatorId: req.app.locals.user.id } });
    if (created) {
        await req.app.locals.UserToBox.create({ rights: 'rwd', BoxId: box.id, UserId: req.app.locals.user.id });
    } else {
        const userToBox = await req.app.locals.UserToBox.findOne({ where: { UserId: req.app.locals.user.id, BoxId: box.id } })
        if (!userToBox.rights.includes('w')) {
            res.status(403).send('Keine Berechtigung für diese Aktion');
            return
        }
    }
    const newCardsArray = req.body.cards.map(item => { return { 'front': item[0], 'back': item[1], 'BoxId': box.id } });
    const cards = await req.app.locals.Card.bulkCreate(newCardsArray, { ignoreDuplicates: true });
    const dublettes = cards.filter(item => item.id === null);
    await req.app.locals.user.addCards(cards.filter(item => item.id !== null));
    res.status(200).json({ message: 'success!', Doublettes: dublettes });
    // } catch (err) {
    //     res.status(400).json({ message: err })
    // }
});

/**
 * @swagger
 * /boxes:
 *   post:
 *     security: 
 *         - bearerAuth: []
 *     tags: [Boxes]
 *     summary: Erstellt eine neue Box
 *     description: Erstellt eine neue Box
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name der Box
 *                 example: Box 1
 *     responses:
 *       '200':
 *         description: Erfolgreiche Erstellung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Box'
 */

router.post('/', async function (req, res) {
    const newName = req.body?.name?.trim();
    if (!newName || newName === "") {
        res.status(400).send("Ungülger Name");
        return
    }
    let box = await req.app.locals.Box.findOne({ where: { name: req.body.name } });
    if (box !== null) {
        res.status(400).send(`Name ${req.body.name} bereits vorhanden.`);
        return
    }
    box = await req.app.locals.Box.create({ name: req.body.name, creatorId: req.app.locals.user.id });
    const userToBox = await req.app.locals.UserToBox.create({ rights: "rwd", BoxId: box.id, UserId: req.app.locals.user.id });
    const payload = { ...JSON.parse(JSON.stringify(box)), creator: req.app.locals.user.name, rights: "rwd" }
    res.status(200).json(payload);
})

/**
 * @swagger
 * /boxes:
 *   put:
 *     security: 
 *         - bearerAuth: []
 *     tags: [Boxes]
 *     summary: Ändert den Namen einer vorhandenen Box
 *     description: Ändert den Namen einer vorhandenen Box
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               BoxId:
 *                 type: integer
 *                 description: ID der zu aktualisierenden Box
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: Neuer Name für die Box
 *                 example: Neue Box
 *     responses:
 *       '200':
 *         description: Erfolgreiche Änderung
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Box'
 *       '400':
 *         description: Fehlerhafte Anfrage
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
    const newName = req.body.name.trim();
    if (newName === "") {
        res.status(400).send("ungülig");
        return
    }
    const box = await req.app.locals.Box.findOne({
        where: {
            id: req.body.BoxId,
        },
        include: [
            {
                model: req.app.locals.User,
                through: {
                    model: req.app.locals.UserToBox,
                    where: {
                        UserId: req.app.locals.user.id
                    }
                }
            }
        ]
    });

    if (!box || !box.Users[0] || !box.Users[0].UserToBox.rights.includes('d')) {
        res.status(400).send('No permission to change the name');
        return
    }
    try {
        box.name = newName;
        await box.save();
    } catch (err) {
        res.status(400).json({ message: err });
        return
    }
    const creatorName = await req.app.locals.User.findByPk(box.creatorId, { attributes: ['name'] });
    const payload = {
        id: box.id,
        name: box.name,
        creatorId: box.creatorId,
        creator: creatorName.name,
        rights: box.Users[0].UserToBox.rights
    }
    res.status(200).json(payload);
})

module.exports = router;