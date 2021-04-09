export function isValidTrackCode(trackCode: string) {
	if (!trackCode) return false;

	if (trackCode.length !== 13) return false;

	const pattern = new RegExp(/[a-zA-Z]{2}[0-9]{9}[a-zA-Z]{2}/);

	return pattern.test(trackCode);
}