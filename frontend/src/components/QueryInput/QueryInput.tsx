import { runQuery, fetchGraph } from "../../helpers/api";
import "./queryInput.css"
import React, { useState } from 'react';

export function QueryInput({ setQuery } : { setQuery : any }) {
    const [queryTextInput, setQueryTextInput ] = useState('');

    const OnRunQuery = async () => {
        try {
            setQuery(queryTextInput);
            // const resp = await fetchGraph(queryTextInput);
            // console.log("Successfully ran query: ");
            // console.log(queryTextInput);
            // console.log("Response: ", resp);
        } catch (e) { throw e; }

    }

    const handleInputChange = (e: any) => {
        setQueryTextInput(e.target.value);
    };

    const clearQueryBox = () => {
        setQueryTextInput('');
    };

    return (
        <div className="query-input">
            <div className="query-input-header">
                <h3>SQL Query</h3>
                <div className="query-actions">
                    <button 
                        className="run-button"
                        onClick={ OnRunQuery }
                    >
                        Run Query
                    </button>
                    <button className="clear-button" 
                            onClick={clearQueryBox}>Clear</button>
                </div>
            </div>
            <textarea 
                className="query-textarea"
                placeholder="Enter your SQL query here..."
                value={queryTextInput}
                onChange={handleInputChange}
                rows={4}
            />
        </div>
    )
}
