const permissions = {
	ENGINEER: Number(process.env.ENGINEER_PERMISSION_ID as string) as number,
	MANAGER: Number(process.env.MANAGER_PERMISSION_ID as string) as number,
	getStringPermission: (permission: number): string => {
		switch (permission) {
			case permissions.ENGINEER:
				return 'engineer';
			case permissions.MANAGER:
				return 'manager';
			default:
				return 'unknown';
		}
	},
	getNumberPermission: (permission: string): number => {
		switch (permission) {
			case 'engineer':
				return permissions.ENGINEER;
			case 'manager':
				return permissions.MANAGER;
			default:
				return -1;
		}
	}
};

console.log('[PERMS] Permissions loaded: ', permissions);

export default permissions;
