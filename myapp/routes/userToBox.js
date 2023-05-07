var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /userToBox:
 *   put:
 *     tags: [UserToBox]
 *     security: 
 *         - bearerAuth: []
 *     summary: Update or create a new UserToBox relationship and UserToCards for a user
 *     description: This endpoint updates or creates a UserToBox relationship and initializes UserToCards for all cards in the box if the relationship was just created.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserId:
 *                 type: integer
 *                 description: The ID of the user
 *                 example: 1
 *               BoxId:
 *                 type: integer
 *                 description: The ID of the box
 *                 example: 36
 *               rights:
 *                 type: string
 *                 description: The rights of the user for the box
 *                 example: rwd
 *     responses:
 *       200:
 *         description: Successfully updated or created UserToBox and UserToCards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: success!
 */

router.put('/', async function (req, res) {
    try {

        const [userToBox, created] = await req.app.locals.UserToBox.findOrCreate({
            where: {
                UserId: req.body.UserId,
                BoxId: req.body.BoxId
            },
            defaults: {
                UserId: req.body.UserId,
                BoxId: req.body.BoxId,
                rights: req.body.rights
            }
        })
        userToBox.rights = req.body.rights;
        await userToBox.save();
        if (created) {
            const cardsOfBox = await req.app.locals.Card.findAll({ attributes: ['id'], where: { BoxId: req.body.BoxId } });
            const allUserToCards = JSON.parse(JSON.stringify(cardsOfBox)).map(item => {
                return {
                    pocket: 0,
                    lastTimePicked: 0,
                    CardId: item.id,
                    UserId: req.body.UserId
                }
            })
            const userToCards = await req.app.locals.UserToCard.bulkCreate(allUserToCards, { ignoreDuplicates: true })
        }
        res.status(200).json({ message: 'success!' })

    } catch (err) { res.status(400).json(err) }
})
module.exports = router;