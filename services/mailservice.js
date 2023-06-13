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

  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to,
      subject: 'Your activation link',
      html: `<div>
            <h1>For activation hit this link</h1>
            <a href="${link}">${link}</a>
            </div>`,
    });
  }
}

export default new MailService();
