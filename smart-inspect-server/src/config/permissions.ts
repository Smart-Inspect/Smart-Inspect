const permissions = {
	ENGINEER: Number(process.env.ENGINEER_PERMISSION_ID as string) as number,
	MANAGER: Number(process.env.MANAGER_PERMISSION_ID as string) as number
};

console.log('[PERMS] Permissions loaded: ', permissions);

export default permissions;
