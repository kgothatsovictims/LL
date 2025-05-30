const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send order email
app.post('/send-order', async (req, res) => {
    const { from_name, from_email, phone_number, order_details, total } = req.body;

    // Validate request body
    if (!from_name || !from_email || !phone_number || !order_details || !total) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: `New Order from ${from_name}`,
        text: `
            New order received!

            Customer: ${from_name}
            Email: ${from_email}
            Phone: ${phone_number}

            Order Details:
            ${order_details}

            Total: ${total}
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Order email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send order email' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});