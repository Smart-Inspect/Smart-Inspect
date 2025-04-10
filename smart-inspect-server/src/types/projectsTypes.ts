import * as t from 'io-ts';
import types from '../utils/types';

const projectType = {
	ForCreate: t.strict({
		name: t.string,
		description: t.string,
		buildingId: t.string,
		unitNumbers: t.array(t.string),
		engineerIds: t.array(t.string),
		engineerToUnits: t.array(t.strict({ engineerId: t.string, unitNumbers: t.array(t.string) })),
		metricsSchema: t.array(t.strict({ name: t.string, fieldType: t.string, values: t.array(t.union([t.string, t.number])) }))
	}),
	ForEdit: t.strict({
		name: types.optional(t.string),
		description: types.optional(t.string),
		unitNumbers: types.optional(t.array(t.string)),
		engineerIds: types.optional(t.array(t.string)),
		status: types.optional(t.keyof({ started: null, completed: null, 'not-started': null })),
		engineerToUnits: types.optional(t.array(t.strict({ engineerId: t.string, unitNumbers: t.array(t.string) }))),
		metricsSchema: types.optional(t.array(t.strict({ name: t.string, fieldType: t.string, values: t.array(t.union([t.string, t.number])) })))
	}),
	ForDeleteLayouts: t.strict({
		layoutIds: t.array(t.string)
	})
};

export default projectType;
