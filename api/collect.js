const mysql = require('mysql2/promise');
const TelegramBot = require('node-telegram-bot-api');

export default async function handler(req, res) {
    const { id } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!id) {
        return res.status(400).send('User ID is required');
    }

    try {
        // Database connection
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

        // Send "Thank you" message via Telegram
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
        await bot.sendMessage(id, '✅ Thank you for verifying! Your account is now active.');

        // Redirect back to your bot
        const botUsername = 'YOUR_BOT_USERNAME'; // Update this to your bot handle
        return res.redirect(`https://t.me/${botUsername}`);
    } catch (error) {
        console.error('Error in IP collection/verification:', error);
        return res.status(500).send('Internal Server Error');
    }
}
