import nodemailer from 'nodemailer';

import { SMTP } from '../constants/index.js';
import { getEnvVariable } from '../utils/getEnvVariable.js';

const transporter = nodemailer.createTransport({
  host: getEnvVariable(SMTP.SMTP_HOST),
  port: Number(getEnvVariable(SMTP.SMTP_PORT)),
  auth: {
    user: getEnvVariable(SMTP.SMTP_USER),
    pass: getEnvVariable(SMTP.SMTP_PASSWORD),
  },
});

export const sendEmail = async (mail) => {
  mail.from = 'alena.havaleshko@gmail.com';

  return await transporter.sendMail(mail);
export const sendEmail = async ({ from, to, subject, html }) => {
  try {
    await transporter.sendMail({ from, to, subject, html });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
