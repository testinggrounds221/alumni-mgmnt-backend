const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  try {
    sgMail.send({
      to: email,
      from: "testinggrounds221@gmail.com",
      subject: "Hey There",
      text: `Hey ${name}.`,
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
