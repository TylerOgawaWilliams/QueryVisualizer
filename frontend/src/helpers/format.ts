export function FormatFilter(filter: string | undefined) {
    if (!filter) return undefined;

    const new_filter = filter.replace(
        /::[\w\[\]]+/g, "" // removes ::integer
    ).replace(
        /^\(/ , ""
    ).replace(
        /\)$/ , ""
    ).replace(
        /\(\(([\w.-]+)\)/g, '($1'
    ).replace(
        /AND/g, "\nAND"
    ).replace(
        /OR/g, "\n  OR"
    ).replace(
        /~~\s/, "LIKE"
    ).replace(
        /~~\*/, "ILIKE"
    ).replace(
        /ANY\s*\('\{([\w\,-]+)\}'\)/g, 'ANY ($1)'
    ).replace(
        /hashed/g, "IN"
    )

    return new_filter;
}