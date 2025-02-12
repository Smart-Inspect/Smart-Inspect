import * as t from 'io-ts';
import types from '../utils/types';

const authType = {
	ForRefresh: t.strict({
		refreshToken: types.optional(t.string)
	})
};

export default authType;
