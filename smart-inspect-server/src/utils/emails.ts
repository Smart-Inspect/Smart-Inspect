import { SentMessageInfo } from 'nodemailer';
import mail from '../config/mail';

const emails = {
	sendVerification: async (email: string, token: string): Promise<SentMessageInfo> => {
		return await mail.send(
			email,
			'Smart Inspect Account Verification',
			undefined,
			`<h3>Welcome new Smart Inspect user!</h3><p>To verify your account, please click the following link:</p><p><a href="${process.env.WEB_URL}/verify/${token}">${process.env.WEB_URL}/verify/${token}</a></p>`
		);
	},
	sendResetPassword: async (email: string, token: string): Promise<SentMessageInfo> => {
		return await mail.send(
			email,
			'Smart Inspect Password Reset',
			undefined,
			`<h3>Reset your Smart Inspect password</h3><p>To reset your password, please click the following link:</p><p><a href="${process.env.WEB_URL}/password-reset/${token}">${process.env.WEB_URL}/password-reset/${token}</a></p>`
		);
	}
};

export default emails;
