import React from "react";
import "./sidebar.css";

export function Sidebar() {
    return (
        <aside className="app-sidebar">
          <div className="sidebar-content">
            <div className="database-info">
              <div className="db-header">Database</div>
              <div className="db-tables">
                <div className="table-item">Tables</div>
                <div className="table-item">Views</div>
                <div className="table-item">Functions</div>
              </div>
            </div>
          </div>
        </aside>
    )
}