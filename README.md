
# 🏥 Hospital P2E (Thirdweb + Vite + Capacitor)

Protótipo pronto para você adaptar o template `thirdweb-example/play-to-earn-game` ao tema de hospital.
- Front-end: React + Vite + Thirdweb React SDK
- Blockchain: configure sua rede EVM e contratos via `.env`
- Mobile: Capacitor para empacotar como app Android/iOS

---

## ✅ Como rodar (Web)
1. Instale Node 18+
2. Instale dependências:
   ```bash
   npm install
   ```
3. Crie `.env` a partir de `.env.example` e preencha:
   ```bash
   cp .env.example .env
   # edite os valores conforme sua rede/contratos
   ```
4. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```

## ⚙️ Variáveis .env
- `VITE_CHAIN_ID`: ID da rede (ex.: 11155111 para Sepolia)
- `VITE_RPC_URL`: RPC HTTP da rede
- `VITE_ERC20_ADDRESS`: contrato do seu token ERC-20 (recompensas)
- `VITE_STAKING_ADDRESS`: contrato do seu Staking/Rewards (opcional neste protótipo)
- `VITE_TOKEN_SYMBOL`: símbolo do token (ex.: HLTH)
- `VITE_TOKEN_DECIMALS`: casas decimais (18 na maioria ERC-20)

## 🧠 Lógica de Recompensa (demo)
- O botão **Iniciar turno** começa uma contagem de segundos.
- **Encerrar turno** calcula uma recompensa estimada (client-side) e registra no log.
- Em produção, substitua pela chamada ao seu contrato de **Staking/Rewards**:
  - `startShift()` armazena `msg.sender` e `block.timestamp`.
  - `endShift()` calcula recompensa `(block.timestamp - startedAt) * rate` e transfere/minta tokens ERC-20.

### Esboço de contrato (Solidity) para referência
> Use Thirdweb ContractKit para gerar e publicar.
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IToken {
    function mintTo(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
}

contract HospitalStaking {
    address public owner;
    IToken public rewardToken;
    uint256 public ratePerSecond; // em wei do token

    struct Shift { uint256 startedAt; uint256 earned; bool active; }

    mapping(address => Shift) public shifts;

    constructor(address _token, uint256 _rate) {
        owner = msg.sender;
        rewardToken = IToken(_token);
        ratePerSecond = _rate;
    }

    function startShift() external {
        require(!shifts[msg.sender].active, "ja em turno");
        shifts[msg.sender] = Shift(block.timestamp, 0, true);
    }

    function endShift() external {
        Shift storage s = shifts[msg.sender];
        require(s.active, "sem turno");
        uint256 dt = block.timestamp - s.startedAt;
        uint256 reward = dt * ratePerSecond;
        s.active = false;
        rewardToken.mintTo(msg.sender, reward);
    }
}
```

## 📱 Empacotar para Android/iOS (Capacitor)
1. Build web:
   ```bash
   npm run build
   ```
2. Instale Capacitor (Android/iOS SDKs na sua máquina).
3. Sincronize plataformas:
   ```bash
   npx cap add android
   npx cap add ios
   npm run android   # ou npm run ios
   ```
4. Abra o projeto nativo (Android Studio / Xcode), configure permissões, ícones, etc., e execute em dispositivo/emulador.

## 🖼️ Personalização do Tema Hospitalar
- Substitua `public/hospital.png` pelo seu sprite/ilustração do hospital.
- Edite `src/App.tsx` para criar tarefas (ex.: “Atender paciente”, “Coletar suprimentos”, etc.).
- Integre itens/NFTs (uniforme, estetoscópio) via contratos ERC-1155 ou ERC-721 do Thirdweb.

## 🔐 Carteiras e Onboarding
- Use componentes do `@thirdweb-dev/react` para integrar wallets (MetaMask, WalletConnect).
- Para mobile, considere **wallet embutida** ou **Deep Links** para abrir wallets instaladas.

## 📦 Migração do Example Original
- Este front é independente e mais leve. Se quiser portar toda a lógica do `thirdweb-example/play-to-earn-game`, direcione as chamadas de stake/claim para seus contratos.
- Você pode importar ABI do seu contrato e usar `useContractWrite` / `useContract` do Thirdweb para executar funções.

---

© Você. Use seus próprios assets (imagens/sons) com licença adequada.
