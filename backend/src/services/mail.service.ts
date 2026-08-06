import transporter from '../config/mail.config.js'
import { envConfig } from '../config/env.config.js'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    await transporter.sendMail({
      from: envConfig.MAIL_USER,
      to,
      subject,
      html
    })
  } catch (error) {
    throw new Error(`Email sending failed: ${(error as Error).message}`)
  }
}

export const sendVerificationEmail = async (email: string, token: string) => {
  const link = `${envConfig.CLIENT_URL}/verify-email?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Verify your email',
    html: `
      <h2>Verify your email</h2>
      <p>Click the button below to verify your email address.</p>
      <a href="${link}" style="padding:10px 20px;background:#000;color:#fff;border-radius:5px;text-decoration:none;">
        Verify Email
      </a>
      <p>This link expires in <strong>15 minutes</strong>.</p>
      <p>If you didn't create an account, ignore this email.</p>
    `
  })
}

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const link = `${envConfig.CLIENT_URL}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Reset your password</h2>
      <p>Click the button below to reset your password.</p>
      <a href="${link}" style="padding:10px 20px;background:#000;color:#fff;border-radius:5px;text-decoration:none;">
        Reset Password
      </a>
      <p>This link expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, ignore this email.</p>
    `
  })
}