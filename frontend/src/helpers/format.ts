export function FormatFilter(filter: string | undefined) {
    if (!filter) return "";

    const new_filter = filter.replace(
        /::\w+/g, ""
    ).replace(
        /^\(/ , ""
    ).replace(
        /\)$/ , ""
    ).replace(
        /\(([\w.-]+)\)/g, '$1'
    ).replace(
        /AND/g, "\nAND"
    ).replace(
        /OR/g, "\n  OR"
    ).replace(
        /~~\s/, "LIKE"
    ).replace(
        /~~\*/, "ILIKE"
    ).replace(
        /ANY\s\('\{([\w\,]+)\}'\[\]\)/, 'ANY ($1)'
    )

    return new_filter;
}