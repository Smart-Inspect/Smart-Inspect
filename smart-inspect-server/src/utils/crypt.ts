import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string);

const crypt = {
	async hashPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		return await bcrypt.hash(password, salt);
	},

	comparePasswords(password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}
};

export default crypt;
