import * as t from 'io-ts';
//import * as td from 'io-ts-types';

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
	})
};

export default userType;
