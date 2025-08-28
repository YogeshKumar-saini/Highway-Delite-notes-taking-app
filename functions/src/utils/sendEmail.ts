import nodeMailer from "nodemailer";

interface SendEmailParams {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async ({ email, subject, message }: SendEmailParams) => {
  const transporter = nodeMailer.createTransport({
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    secure: false, // set to true if using port 465
    // optionally add 'host' if using SMTP transport:
    host: process.env.SMTP_HOST,
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  };
  await transporter.sendMail(options);
};