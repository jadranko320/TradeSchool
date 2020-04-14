const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // fn wysyłająca email
  // 1) Create a transporter - transporter zawiera dane ze zmiennych środowiskowych
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // strona
    port: process.env.EMAIL_PORT, // port
    auth: {
      user: process.env.EMAIL_USERNAME, // użytkownik
      pass: process.env.EMAIL_PASSWORD // hasło
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'TradeSchool', // nadawca
    to: options.email, // odbiorca
    subject: options.subject, // temat
    text: options.message // wiadomość
    // html: - opcjonalnie html do formatowania wiadomości
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
