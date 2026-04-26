const mysql = require('mysql2');
const TelegramBot = require('node-telegram-bot-api');

module.exports = async (req, res) => {
    const { id } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Check if all environment variables are present
    const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'TELEGRAM_BOT_TOKEN'];
    const missingEnv = requiredEnv.filter(key => !process.env[key]);
    
    if (missingEnv.length > 0) {
        return res.status(500).json({ error: 'Missing environment variables', missing: missingEnv });
    }

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
        }).promise();

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
        const botUsername = 'botipcollectbot'; // Set this to your bot handle
        return res.redirect(`https://t.me/${botUsername}`);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Server Error', 
            details: error.message,
            code: error.code || 'N/A'
        });
    }
};
