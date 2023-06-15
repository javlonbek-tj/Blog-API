import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
  }

  async sendMail(to, subject, html) {
    await this.transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to,
      subject,
      html,
    });
  }
}

export default new MailService();
