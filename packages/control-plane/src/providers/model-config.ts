import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

export type ModelConfig = {
  baseUrl: string
  apiKey: string
  provider: 'local' | 'openai' | 'anthropic' | 'custom'
}

const DEFAULT_CONFIG: ModelConfig = {
  baseUrl: 'http://localhost:11434/v1',
  apiKey: 'local',
  provider: 'local',
}

function readConfigFile(): Partial<ModelConfig> | null {
  try {
    const configPath = join(homedir(), '.8gent', 'config', 'models.json')
    const raw = readFileSync(configPath, 'utf-8')
    return JSON.parse(raw) as Partial<ModelConfig>
  } catch {
    return null
  }
}

function inferProvider(baseUrl: string): ModelConfig['provider'] {
  if (baseUrl.includes('openai.com')) return 'openai'
  if (baseUrl.includes('anthropic.com')) return 'anthropic'
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) return 'local'
  return 'custom'
}

export function loadModelConfig(): ModelConfig {
  const envBaseUrl = process.env.PROVIDER_BASE_URL
  const envApiKey = process.env.PROVIDER_API_KEY

  if (envBaseUrl && envApiKey) {
    return {
      baseUrl: envBaseUrl,
      apiKey: envApiKey,
      provider: inferProvider(envBaseUrl),
    }
  }

  const fileConfig = readConfigFile()
  if (fileConfig?.baseUrl && fileConfig?.apiKey) {
    return {
      baseUrl: fileConfig.baseUrl,
      apiKey: fileConfig.apiKey,
      provider: fileConfig.provider ?? inferProvider(fileConfig.baseUrl),
    }
  }

  return DEFAULT_CONFIG
}
