import { Resend } from 'resend'
import { emailConfig as envEmailConfig } from '@/lib/config'

export const resend = new Resend(envEmailConfig.apiKey)

export const emailConfig = {
  from: `${envEmailConfig.fromName} <${envEmailConfig.from}>`,
  replyTo: envEmailConfig.from
}
