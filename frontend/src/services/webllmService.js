import {
  CreateWebWorkerMLCEngine,
  prebuiltAppConfig,
  modelLibURLPrefix,
  modelVersion,
} from '@mlc-ai/web-llm'

const LLAMA_32_3B_WASM =
  modelLibURLPrefix + modelVersion + '/Llama-3.2-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm'

const CUSTOM_MODEL_URL = import.meta.env.VITE_WEBLLM_MODEL_URL
const CUSTOM_MODEL_ID = import.meta.env.VITE_WEBLLM_MODEL_ID || 'kit-ai-medical-v1'

const customModelRecord = CUSTOM_MODEL_URL
  ? {
      model: CUSTOM_MODEL_URL,
      model_id: CUSTOM_MODEL_ID,
      model_lib: LLAMA_32_3B_WASM,
      overrides: { context_window_size: 4096 },
    }
  : null

const DEFAULT_MODEL = customModelRecord ? CUSTOM_MODEL_ID : 'Llama-3.2-3B-Instruct-q4f32_1-MLC'

let engine = null
let worker = null

export async function initEngine(modelId = DEFAULT_MODEL, onProgress) {
  if (engine) {
    return engine
  }

  worker = new Worker(
    new URL('../worker/webllm-worker.js', import.meta.url),
    { type: 'module' }
  )

  const appConfig = {
    ...prebuiltAppConfig,
    useIndexedDBCache: true,
    model_list: customModelRecord
      ? [...prebuiltAppConfig.model_list, customModelRecord]
      : prebuiltAppConfig.model_list,
  }

  const engineConfig = {
    appConfig,
    initProgressCallback: (report) => {
      if (onProgress && report) {
        const progress = report.progress ?? 0
        onProgress({ ...report, progress: progress * 100 })
      }
    },
    logLevel: 'WARN',
  }

  engine = await CreateWebWorkerMLCEngine(worker, modelId, engineConfig)
  return engine
}

export async function chat(messages, options = {}) {
  if (!engine) {
    throw new Error('Engine not initialized. Call initEngine first.')
  }

  const { stream = true } = options
  const chunks = await engine.chat.completions.create({
    messages,
    stream,
    ...options,
  })

  if (stream) {
    return chunks
  }
  return chunks.choices[0]?.message?.content ?? ''
}

export async function unloadEngine() {
  if (engine) {
    await engine.unload()
    engine = null
  }
  if (worker) {
    worker.terminate()
    worker = null
  }
}

export function hasWebGPU() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}
