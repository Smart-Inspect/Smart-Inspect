import * as t from 'io-ts';
import types from '../utils/types';

const inspectionType = {
	ForEdit: t.strict({
		inspectionDate: types.optional(t.string),
		layoutId: types.optional(t.string),
		notes: types.optional(t.string),
		metrics: types.optional(t.array(t.strict({ name: t.string, value: t.union([t.string, t.number, t.null]) }))),
		status: types.optional(t.keyof({ completed: null, started: null, 'not-started': null }))
	}),
	ForDeletePhotos: t.strict({
		photoIds: t.array(t.string)
	})
};

export default inspectionType;
