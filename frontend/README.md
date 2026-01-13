# Fluxo - The Sovereign Intelligence Agent

**Fluxo** is an autonomous, privacy-first intelligence agent built for the **Mantle Network**. It aggregates real-time portfolio tracking, algorithmic risk analysis, yield intelligence, and decentralized execution into a single "Deep Intel" interface.

Unlike standard dashboards, Fluxo operates as a **State-Aware Agent**—continuously polling, analyzing, and synthesizing on-chain data to provide actionable "Alpha Vectors" rather than just raw numbers.

---

## 🏗 Architecture & Working Mechanism

Fluxo follows a **Hybrid Intelligence Architecture**, combining a high-performance Next.js frontend with a robust polling engine that mimics an autonomous backend agent.

### 1. The Intelligence Engine (`FluxoProvider`)
At the core of the application lies the `FluxoProvider` (`src/providers/FluxoProvider.tsx`). This context acts as the "brain" of the agent.
- **State Management**: Centralizes all intelligence data (Alerts, Portfolio, Risk Scores) to prevent re-render thrashing.
- **Autonomous Polling**: Uses a strictly memoized polling interval (30s) to fetch data from the backend/blockchain without user intervention.
- **Deduplication**: Implements `useRef` guards to prevent duplicate API calls during strict-mode renders or rapid navigation.

### 2. The Execution Layer (`Fluxo Router`)
Swap functionality is powered by a bespoke SDK wrapper (`src/lib/fusionXSwapHelper.ts`).
- **Direct Router Interaction**: Bypasses generic aggregators to interact directly with the FusionX V2 Router contract (`0x362...`).
- **Safety First**: Implements pre-flight checks for allowances and balances before attempting any transaction.
- **Smart Quoting**: Manually calculates exchange rates and price impacts even when the underlying router only provides raw amounts.

### 3. The API Layer (`ApiClient`)
All external communication is handled by a singleton `ApiClient` (`src/lib/api/client.ts`).
- **Type Safety**: Strictly typed generics for every endpoint (Portfolio, Market, Governance).
- **Request Strategy**: Supports "stale-while-revalidate" caching strategies to ensure instant UI loads while fresh data fetches in the background.

---

## 📂 Project Structure

The project is structured to separate **Intelligence** (Data) from **Execution** (UI).

```
src/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── dashboard/        # Main Intelligence Dashboard
│   ├── exchange/         # Swap Interface (The Router)
│   ├── portfolio/        # Deep Asset Analysis
│   ├── risk/             # Sovereign Shield Audit System
│   ├── social/           # Narrative & Sentiment Tracker
│   └── yield/            # Yield Opportunity Scout
│
├── components/           # Reusable UI Blocks
│   ├── dashboard/        # Widgets (Top Yields, Recent Alerts)
│   ├── ExecutionTab/     # Swap UI (TokenSelector, PriceDisplay)
│   └── ui/               # Design System (Glassmorphic Cards, Inputs)
│
├── hooks/                # Intelligence Hooks
│   ├── useFluxo.ts       # Global Agent State Access
│   ├── useFusionXSwap.ts # Wallet & Router Connection
│   └── useSwapQuote.ts   # Real-time Pricing Logic
│
├── lib/                  # Core Logic & Utilities
│   ├── api/              # API Client & Endpoints
│   ├── fusionXSwapHelper # The Custom DEX SDK
│   └── tokenList.ts      # Mantle Token Registry
│
└── providers/            # Context Providers (Web3, Fluxo Agent)
```

---

## ⚡ Core Event Flows

### A. The "Alpha Vector" Loop (Dashboard)
1. **Init**: User lands on Dashboard. `FluxoProvider` mounts.
2. **Poll**: `fetchAlerts()` runs immediately, then every 30s.
3. **Analyze**: Incoming alerts are risk-scored (High/Medium/Low).
4. **Render**: Dashboard updates "Alpha Vectors" list without full page reload.

### B. The "Sovereign Swap" Flow (Exchange)
1. **Input**: User selects MNT -> USDC.
2. **Quote**: `useSwapQuote` fires, calling `swapHelper.getETHToTokenQuote`.
3. **Calculate**: Helper interacts with Router Contract to get `amountOut`. Hooks calculate `Price Impact`.
4. **Execute**: User clicks "Swap". `SwapButton` triggers `swapExactETHForTokens`.
5. **Verify**: Transaction hash is tracked until confirmation on Mantle.

---

## 🎨 Design System: "Deep Intel"

Fluxo uses a custom design system built on **Tailwind CSS v4** and **Glassmorphism**.
- **Variables**: Defined in `globals.css` (primary purples, deep backgrounds).
- **Fonts**:
  - `Space Grotesk`: Headers & Data (Futuristic/Numeric).
  - `Inter`: Body text (Readability).
  - `VT323`: Critical Metrics (Retro/Terminal feel).
- **Glass Effects**: All cards use `backdrop-blur-md` and `bg-opacity-10`.

---

## 🛠 Technology Stack

### Core Framework
- **Next.js 16.1** (Turbopack Enabled)
- **React 19** (Server Components)
- **TypeScript 5** (Strict Mode)

### Web3 & Blockchain
- **Wagmi / Viem**: Wallet connection & state.
- **Ethers.js v5**: Contract interaction (Swaps).
- **RainbowKit**: Wallet UI.
- **Mantle Network**: L2 Architecture.

### UI & Styling
- **Tailwind CSS v4**: Utility-first styling.
- **Lucide React**: Vector icons.
- **Recharts**: Data visualization.
- **Shadcn/UI**: Component primitives (modified).

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- Mantle RPC URL (Optional, defaults to public)

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/fluxo-frontend.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Development Agent:
   ```bash
   npm run dev
   ```

### Production Build
Fluxo is optimized for **Vercel**.
```bash
npm run build
npx vercel --prod
```

---

## 📜 License

This project is proprietary intelligence software. Access is restricted to authorized agents.
*(MIT License included for demonstration purposes).*

---
**Fluxo** — *Sovereignty is the ultimate alpha.*
