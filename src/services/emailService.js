const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendPasswordResetEmail = async (email, resetUrl) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@wingtime.com',
        to: email,
        subject: 'WingTime Password Reset Request',
        html: `
            <p>You requested a password reset for your WingTime account.</p>
            <p>Click the link below to reset your password. This link expires in 10 minutes.</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    });
};

module.exports = { sendPasswordResetEmail };
