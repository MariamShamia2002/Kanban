import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient ,QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 4xx — only on transient errors (5xx / network)
      retry: (failureCount, error) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status: number }).status === "number" &&
          (error as { status: number }).status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30_000,
    },
  },
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
  </StrictMode>,
)
