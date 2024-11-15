import * as t from 'io-ts';

const type = {
	validateType<A>(data: string, type: t.Type<A>): boolean {
		const validationResult = type.decode(data);
		if (validationResult._tag === 'Left') {
			return false;
		}
		return true;
	},
	optional<A>(type: t.Type<A>) {
		return t.union([type, t.undefined, t.null]);
	}
};

export default type;
