import type { ModelConfig } from './model-config.js'

export type ProviderClient = {
  baseUrl: string
  apiKey: string
  headers: Record<string, string>
}

/**
 * Creates a fetch-based OpenAI-compatible provider client.
 * Returns the config needed to make OpenAI-compatible HTTP requests.
 * Not a full SDK — just the essentials for constructing requests.
 */
export function createProvider(config: ModelConfig): ProviderClient {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  }

  return {
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    headers,
  }
}
