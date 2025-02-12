import * as t from 'io-ts';
import types from '../utils/types';

const inspectionType = {
	ForEdit: t.strict({
		inspectionDate: types.optional(t.string),
		layoutId: types.optional(t.string),
		notes: types.optional(t.string),
		metrics: types.optional(t.array(t.strict({ name: t.string, value: t.union([t.string, t.number]) }))),
		status: types.optional(t.keyof({ completed: null, 'not-started': null }))
	}),
	ForUploadPhoto: t.strict({
		timestamp: t.string
	}),
	ForDeletePhotos: t.strict({
		photoIds: t.array(t.string)
	})
};

export default inspectionType;
