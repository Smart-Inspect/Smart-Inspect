import * as t from 'io-ts';
//import * as td from 'io-ts-types';

const refreshType = {
	ForRefresh: t.strict({
		refreshToken: t.string
	})
};

export default refreshType;
