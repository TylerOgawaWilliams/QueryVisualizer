import { ReactFlowProvider } from 'reactflow';
import { QueryInput } from './components/QueryInput/QueryInput'
import { QueryTree } from './components/QueryTree/QueryTree'

function App() {

  return (
    <ReactFlowProvider>
      <QueryInput />
      <QueryTree />
    </ReactFlowProvider>
  )
}

export default App
