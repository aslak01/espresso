export function assembleQuery(
	searchkey: string,
	params: Record<string, string>,
) {
	const query = new URLSearchParams();
	query.append("searchkey", searchkey);
	query.append("vertical", "bap");

	Object.entries(params).forEach(([param, value]: [string, string]) => {
		if (value !== "" && value !== "section") {
			query.append(param, value);
		}
	});

	return query.toString();
}
