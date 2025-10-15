import "./queryInput.css"
import React, { useState } from 'react';

export function QueryInput() {
    const [queryTextInput, setQueryTextInput ] = useState('');

    const handleInputChange = (e) => {
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
                    <button className="run-button">Run Query</button>
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
