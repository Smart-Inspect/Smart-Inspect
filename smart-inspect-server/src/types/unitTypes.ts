import * as t from 'io-ts';
import types from '../utils/types';

const unitType = {
	ForEdit: t.strict({
		number: types.optional(t.string)
	})
};

export default unitType;
