const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  try {
    sgMail.send({
      to: email,
      from: "testinggrounds221@gmail.com",
      subject: "Welocome To Alumni Management !",
      text: `Hey ${name}!! Excited to have you with us. Stay tuned to our website to get awesome and fresh updates regarding our Campus `,
    });
  } catch (e) {
    console.log(e);
  }
};

const sendCancellationEmail = (email, name) => {
  try {
    sgMail.send({
      to: email,
      from: "testinggrounds221@gmail.com",
      subject: "Sorry to see you go",
      text: `Goodbye ${name}. Hope to see you anytime soon`,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
