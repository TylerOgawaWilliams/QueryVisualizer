import { QueryInput } from './components/QueryInput/QueryInput'
import { QueryTree } from './components/QueryTree/QueryTree'

import './App.css'


function App() {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo-container">
            <svg className="logo-svg" viewBox="0 0 369.02 324.42" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>
                  {`.cls-1 {
                    font-family: OCRAStd, 'OCR A Std';
                    font-size: 290.79px;
                    fill: #828574;
                  }
                  .cls-2 {
                    font-family: OCRAbyBT-Regular, 'OCR-A BT';
                    font-size: 82.84px;
                    fill: #828574;
                  }`}
                </style>
              </defs>
              <text className="cls-1" transform="translate(8 262.57)"><tspan x="0" y="0">Q</tspan></text>
              <text className="cls-2" transform="translate(184.51 262.57)"><tspan x="0" y="0">VIZ</tspan></text>
            </svg>
          </div>
          <div className="nav-tabs">
            <div className="nav-tab active">Demo</div>
            <div className="nav-tab">445</div>
          </div>
        </div>
        <div className="header-right">
          <div className="header-icon">Q</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="app-main">
        {/* Sidebar */}
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

        {/* Content Area */}
        <main className="app-content">
          <QueryInput />
          <QueryTree />
        </main>
      </div>
    </div>
  )
}

export default App
