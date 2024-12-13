import nodemailer from 'nodemailer';

class Mail {
	private transporter!: nodemailer.Transporter;

	async setup() {
		// Create a test account (for development, use a real account in production)
		const account = await nodemailer.createTestAccount();

		this.transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false, // true for port 465, false for other ports
			auth: {
				user: account.user, // generated ethereal user
				pass: account.pass // generated ethereal password
			}
		});

		console.log('[MAIL] Email system created: %s', account.user);
	}

	async send(to: string, subject: string, text: string | undefined, html: string | undefined): Promise<nodemailer.SentMessageInfo> {
		const info = await this.transporter.sendMail({
			from: '"Smart Inspect" <no-reply@smart-inspect.monstroe.live>',
			to,
			subject,
			text,
			html
		});

		console.log('[MAIL] Message sent: %s', info.messageId);
		console.log('[MAIL] Preview URL: %s', nodemailer.getTestMessageUrl(info));

		return info;
	}
}

const mail: Mail = new Mail();

export default mail;
