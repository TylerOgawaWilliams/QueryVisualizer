import { QueryInput } from './components/QueryInput/QueryInput'
import { QueryTree } from './components/QueryTree/QueryTree'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <QueryInput />
      <QueryTree />
    </QueryClientProvider>
  )
}

export default App
