import nodemailer from 'nodemailer';

export default class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.email,
      to,
      subject: 'Your activation link',
      html: `<div>
            <h1>For activation hit this link</h1>
            <a href="${link}">${link}</a>
            </div>`,
    });
  }
}
