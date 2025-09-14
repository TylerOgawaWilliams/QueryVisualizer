import "./queryInput.css"

export function QueryInput() {
    return (
        <div className="query-input">
            <div className="query-input-header">
                <h3>SQL Query</h3>
                <div className="query-actions">
                    <button className="run-button">Run Query</button>
                    <button className="clear-button">Clear</button>
                </div>
            </div>
            <textarea 
                className="query-textarea"
                placeholder="Enter your SQL query here..."
                rows={4}
            />
        </div>
    )
}