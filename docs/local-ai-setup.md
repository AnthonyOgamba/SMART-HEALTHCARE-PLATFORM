# Local Genie Cares AI setup (Windows)

Genie Cares uses a protected Node/TypeScript gateway between the Expo app and the explicitly selected provider. Groq is the primary demo provider and Ollama remains the local alternative. The phone never calls either provider directly. Supabase authentication, the `ai_enabled` setting, processing consent, deterministic emergency screening, minimized context, and owner-scoped persistence remain enforced by the gateway.

## Hosted Groq demo configuration

Place the Groq API key only in `local-ai/.env`:

```dotenv
AI_PROVIDER=groq
GROQ_API_KEY=your-server-only-key
GROQ_MODEL=llama-3.1-8b-instant
```

Never use an `EXPO_PUBLIC_` name for this key. For demonstrations, enable Zero Data Retention in Groq Data Controls and use synthetic/test health data unless a privacy, contractual, and security review approves real sensitive data. This prototype does not claim HIPAA, PHIPA, PIPEDA, or other production healthcare certification.

Provider selection is explicit. Set `AI_PROVIDER=ollama` to use the local provider. A failed Groq request is not automatically resent to Ollama or another provider.

## 1. Install Ollama

In PowerShell, install the official Windows package:

```powershell
winget install --id Ollama.Ollama --exact
```

If `winget` is unavailable, download the Windows installer from <https://ollama.com/download/windows>. Open a new PowerShell window after installation.

## 2. Download and test the model

The default development model is `llama3.2:3b`:

```powershell
ollama pull llama3.2:3b
ollama run llama3.2:3b "Reply with only: Hello from Ollama"
```

Confirm the local API is available:

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

Ollama's chat API is local to the laptop. The gateway sends `keep_alive: 0`, so the model unloads after each completed request instead of consuming memory while idle.

## 3. Configure the gateway

From the repository root:

```powershell
Copy-Item local-ai\.env.example local-ai\.env
```

If `.env` already exists, preserve its three Supabase values and replace the old provider variables with:

```dotenv
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_KEEP_ALIVE=0
AI_PROVIDER_TIMEOUT_MS=120000
PORT=5000
```

`SUPABASE_SERVICE_ROLE_KEY` stays only in `local-ai/.env`. Never put it in Expo. Local Ollama needs no AI API key.

## 4. Start and test the gateway

```powershell
Set-Location local-ai
npm install
npm run typecheck
npm run dev
```

In a second PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/health
```

Expect `gateway: "ok"`, `provider: "ollama"`, `available: true`, and the configured model. The protected `/v1` endpoints intentionally require a signed-in user's Supabase bearer token and valid processing consent.

## 5. Find the laptop LAN address

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object InterfaceAlias,IPAddress
```

Choose the IPv4 address on the same Wi-Fi network as the phone, such as `192.168.1.25`. Allow inbound TCP port 5000 in Windows Firewall if prompted.

## 6. Configure Expo

In the mobile app's root `.env`, set:

```dotenv
EXPO_PUBLIC_AI_GATEWAY_URL=http://192.168.1.25:5000
```

Replace the example address with the laptop LAN address, then restart Expo so it reloads environment variables:

```powershell
npx expo start --clear
```

Open the project on the physical phone. The phone and laptop must be on the same reachable LAN. Visit Genie Cares and test chat, a schedule question, symptom guidance, a day summary, appointment preparation, and health history.

## Troubleshooting

- `available: false`: run `ollama serve`, then confirm `ollama list` includes the exact `OLLAMA_MODEL` value.
- The local-service unavailable message: verify `/health`, the LAN IP, firewall access, and Expo's URL.
- Authentication or consent errors: sign in, enable Genie Cares in Settings, and grant Genie Cares processing consent.
- There is no mock response. Provider failures remain visible and no fabricated health guidance is returned.

Future hosted providers can implement the same `AIProvider` interface. Do not send identifiable health records to free external providers without a privacy, contractual, and security review; use synthetic data during provider evaluation.
