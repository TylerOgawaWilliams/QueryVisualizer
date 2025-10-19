import { API_URL } from "../globals";

export async function fetchGraph(query: string) {
    const URL = API_URL + 'query-graph';
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query
            })
        });

        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e); 
    }

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
