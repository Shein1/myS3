import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class Mail {
  constructor() {
    if (!Mail.instance) {
      Mail.instance = this;
      this.initialize();
    }
    return Mail.instance;
  }

  initialize() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  send(to, subject, text, html) {
    const mailOptions = {
      from: 'Admin<admin@express-island.com>', // sender address
      to,
      subject,
      text,
      html,
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return new Error(error);
      }
      return true;
    });
  }
}

const instance = new Mail();
Object.freeze(instance);
export default instance;
