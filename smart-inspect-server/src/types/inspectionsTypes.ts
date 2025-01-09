import * as t from 'io-ts';
import types from '../utils/types';

const inspectionType = {
	ForEdit: t.strict({
		inspectionDate: types.optional(t.string),
		layoutId: types.optional(t.string),
		notes: types.optional(t.string)
	}),
	ForUploadPhoto: t.strict({
		timestamp: t.string
	})
};

export default inspectionType;
