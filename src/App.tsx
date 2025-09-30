
import { ConnectButton, useAddress, useContract, useContractWrite, useTokenBalance } from '@thirdweb-dev/react'
import { useEffect, useMemo, useState } from 'react'

const ERC20_ADDRESS = import.meta.env.VITE_ERC20_ADDRESS as string
const STAKING_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS as string
const TOKEN_SYMBOL = (import.meta.env.VITE_TOKEN_SYMBOL as string) || 'HLTH'
const TOKEN_DECIMALS = Number(import.meta.env.VITE_TOKEN_DECIMALS || 18)

function numberToToken(n:number){ return (n / (10 ** TOKEN_DECIMALS)).toLocaleString(undefined, {maximumFractionDigits:4}) }

export default function App(){
  const address = useAddress()
  const { contract: erc20 } = useContract(ERC20_ADDRESS, 'token')
  const { data: bal } = useTokenBalance(erc20, address)
  const [log, setLog] = useState<string[]>([])
  const push = (s:string)=> setLog(l=>[s, ...l].slice(0,50))

  // Fake shift timer state (client-side for demo). You can move this to a staking contract.
  const [onShift, setOnShift] = useState(false)
  const [startedAt, setStartedAt] = useState<number|undefined>(undefined)

  const elapsed = useMemo(()=> onShift && startedAt ? Math.floor((Date.now()-startedAt)/1000) : 0, [onShift, startedAt])
  useEffect(()=>{
    const id = setInterval(()=>{ if(onShift) { /* trigger re-render */ setStartedAt(s=>s ? s : Date.now()) }}, 1000)
    return ()=> clearInterval(id)
  },[onShift])

  const startShift = ()=>{
    if(!address){ push('Conecte sua carteira para iniciar.'); return }
    setOnShift(true); setStartedAt(Date.now()); push('🩺 Turno iniciado no Hospital.')
  }
  const endShift = async ()=>{
    if(!address){ push('Conecte sua carteira.'); return }
    if(!onShift){ push('Nenhum turno em andamento.'); return }
    setOnShift(false)
    const seconds = Math.max(0, Math.floor((Date.now() - (startedAt||Date.now()))/1000))
    const reward = seconds * 10 // 10 wei/segundo (ajuste como quiser)
    push(`✅ Turno encerrado. Recompensa calculada: ${reward} wei (${(reward/(10**TOKEN_DECIMALS)).toFixed(6)} ${TOKEN_SYMBOL}).`)
    push('👉 Implementar: chamar contrato de Staking/Rewards para mint/transfer da recompensa.')
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">🏥 Hospital P2E</h1>
          <div className="muted">Colete <b>{TOKEN_SYMBOL}</b> trabalhando turnos e cumprindo tarefas.</div>
        </div>
        <ConnectButton theme="dark" />
      </header>

      <div className="row">
        <div className="col card">
          <div className='toolbar' style={{justifyContent:'space-between', marginBottom:12}}>
            <span className="pill">Carteira: {address ? address.slice(0,6)+'…'+address.slice(-4) : 'desconectada'}</span>
            <span className="pill">Saldo: {bal ? `${bal.displayValue} ${bal.symbol}` : '—'}</span>
          </div>
          <div className="scene">
            <div className="hospital">
              <img className="floating" src="/hospital.png" alt="Hospital" />
            </div>
            <div className="hud">
              <div className="stat">Status: {onShift ? 'Em turno' : 'Livre'}</div>
              <div className="stat">Tempo: {elapsed}s</div>
            </div>
          </div>
          <div style={{display:'flex', gap:8, marginTop:12}}>
            <button className="btn" onClick={startShift} disabled={onShift}>Iniciar turno</button>
            <button className="btn secondary" onClick={endShift} disabled={!onShift}>Encerrar turno</button>
          </div>
        </div>

        <div className="col card">
          <h3 style={{marginTop:0}}>Recompensas</h3>
          <p className="muted">Este protótipo calcula recompensas no cliente (para demonstração). Em produção, use um contrato de staking / rewards para:<br/>
            • registrar início/fim de turno<br/>
            • calcular recompensa on-chain (block.timestamp)<br/>
            • mint/transfer de {TOKEN_SYMBOL}<br/>
          </p>
          <div className="log">
            {log.map((l,i)=>(<div key={i}>{l}</div>))}
          </div>
        </div>
      </div>
    </div>
  )
}
