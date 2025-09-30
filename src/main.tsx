
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import App from './App'
import './styles.css'

const chainId = Number(import.meta.env.VITE_CHAIN_ID || 11155111)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThirdwebProvider activeChain={chainId} clientId={undefined}>
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
)
