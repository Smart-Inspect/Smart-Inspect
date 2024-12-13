import * as t from 'io-ts';

const types = {
	validateType<A>(data: string, type: t.Type<A>): boolean {
		const validationResult = type.decode(data);
		if (validationResult._tag === 'Left') {
			return false;
		}
		return true;
	},
	getData<A>(data: string, type: t.Type<A>): A {
		const validationResult = type.decode(data);
		if (validationResult._tag === 'Left') {
			throw new Error('Invalid data');
		}
		return validationResult.right;
	},
	optional<A>(type: t.Type<A>) {
		return t.union([type, t.undefined, t.null]);
	}
};

export default types;
