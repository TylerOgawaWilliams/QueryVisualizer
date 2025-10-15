import { API_URL } from "../globals";

export async function fetchGraph(query: string) {
    const URL = API_URL + 'query-graph';
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query
        })
    });

    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

export async function runQuery(query: string) {
    const URL = API_URL + 'explain';

    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query
        })
    });

    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();

}
