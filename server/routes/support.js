const express = require('express');
const nodemailer = require('nodemailer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure email (use your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Submit support ticket
router.post('/ticket', auth, async (req, res) => {
  try {
    const { subject, message, type, orderId } = req.body;

    const ticketId = 'TKT-' + Date.now();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: `Support Ticket Created: ${ticketId}`,
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Your ticket ID: <strong>${ticketId}</strong></p>
        <p>Issue Type: ${type}</p>
        <p>Subject: ${subject}</p>
        <p>We will respond within 24 hours.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      ticketId,
      message: 'Support ticket created. You will receive an email confirmation.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Contact form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact: ${subject}`,
      html: `
        <h3>New Message from ${name}</h3>
        <p>Email: ${email}</p>
        <p>Subject: ${subject}</p>
        <p>Message:</p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Your message has been sent successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;