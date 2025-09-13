import { API_URL } from "../globals";

export async function fetchGraph() {
    const query = 'SELECT actor_id FROM actor;';

    const URL = API_URL + 'query-graph';
    console.log(URL);
    const response = await fetch(URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query
        })
    });

    if (!response.ok) throw new Error('Network response was not ok');
    else console.log('Successfully fetch query graph!');
    return response.json();
}