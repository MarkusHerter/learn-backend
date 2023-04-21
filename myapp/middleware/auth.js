const jwt = require('jsonwebtoken');
require('dotenv').config();

async function auth(req, res, next) {
    // Prüfen, ob der Authorization-Header vorhanden ist
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    try {
        // Das Token verifizieren
        const decoded = jwt.verify(token, process.env.API_SECRET);
        const user = await req.app.locals.User.findOne({ attributes: ['id', 'name', 'admin'], where: { id: decoded.id } })
        if (user) {
            req.app.locals.user = user;
            next();
        }
        else { res.status(403).json({ message: 'invalid user' }); }
    } catch (err) {
        // Fehler bei der Verifikation des Tokens
        return res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = auth;