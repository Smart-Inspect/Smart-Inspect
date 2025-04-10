import * as t from 'io-ts';
import types from '../utils/types';

const userType = {
	ForCreate: t.strict({
		email: t.string,
		password: t.string,
		firstName: t.string,
		lastName: t.string
	}),
	ForLogin: t.strict({
		email: t.string,
		password: t.string
	}),
	ForForgotPassword: t.strict({
		email: t.string
	}),
	ForVerify: t.strict({
		verifyToken: t.string
	}),
	ForLogout: t.strict({
		refreshToken: types.optional(t.string)
	}),
	ForEdit: t.strict({
		email: types.optional(t.string),
		oldPassword: types.optional(t.string),
		newPassword: types.optional(t.string),
		firstName: types.optional(t.string),
		lastName: types.optional(t.string),
		permissionLevel: types.optional(t.string)
	}),
	ForReset: t.strict({
		resetToken: t.string,
		newPassword: t.string
	})
};

export default userType;
