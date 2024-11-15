import dotenv from 'dotenv';

dotenv.config();

const permissions = {
	ENGINEER: Number(process.env.ENGINEER_PERMISSION_ID as string),
	MANAGER: Number(process.env.MANAGER_PERMISSION_ID as string),
	ADMIN: Number(process.env.ADMIN_PERMISSION_ID as string)
};

export default permissions;
