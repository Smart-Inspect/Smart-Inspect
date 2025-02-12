import * as t from 'io-ts';
import types from '../utils/types';

const buildingType = {
	ForCreate: t.strict({
		name: t.string,
		address: t.string
	}),
	ForEdit: t.strict({
		name: types.optional(t.string),
		address: types.optional(t.string),
		addressHistory: types.optional(t.array(t.string))
	})
};

export default buildingType;
