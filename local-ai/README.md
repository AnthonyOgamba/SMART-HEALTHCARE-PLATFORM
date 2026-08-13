# Genie Cares AI gateway

The gateway uses local Ollama by default. Copy `.env.example` to `.env`, keep the existing Supabase values, and follow [`docs/local-ai-setup.md`](../docs/local-ai-setup.md). Expo calls the gateway over the laptop LAN; it never calls Ollama directly.

Every `/v1` request requires a valid Supabase access token. Before health data is retrieved or sent to the selected provider, the gateway verifies that Genie Cares is enabled and that the user's latest processing consent is granted. Provider access is centralized behind `AIProvider`; routes do not know whether Ollama or a future reviewed provider performs generation.
