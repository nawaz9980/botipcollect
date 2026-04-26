const mysql = require('mysql2/promise');

export default async function handler(req, res) {
    const { id } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!id) {
        return res.status(400).send('User ID is required');
    }

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        // Update the user's IP in the database
        await connection.execute(
            'UPDATE users SET ip = ? WHERE id = ?',
            [ip, id]
        );

        await connection.end();

        // Redirect back to your bot (Replace BOT_USERNAME with your actual bot username)
        const botUsername = 'YOUR_BOT_USERNAME'; 
        return res.redirect(`https://t.me/${botUsername}`);
    } catch (error) {
        console.error('Error updating IP:', error);
        return res.status(500).send('Internal Server Error');
    }
}
