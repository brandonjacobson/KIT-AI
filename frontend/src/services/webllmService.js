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

const DEFAULT_MODEL = customModelRecord ? CUSTOM_MODEL_ID : 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

let engine = null
let worker = null
let initPromise = null // Guards against concurrent init calls (e.g. StrictMode)

export async function initEngine(modelId = DEFAULT_MODEL, onProgress) {
  console.log('[WebLLM] initEngine called', { modelId, hasExistingEngine: !!engine })

  // If already initialized, return the existing engine
  if (engine) {
    console.log('[WebLLM] Engine already exists, returning existing engine')
    return engine
  }

  // If init is already in progress, return the same promise to avoid duplicates
  if (initPromise) {
    console.log('[WebLLM] Init already in progress, waiting for existing promise')
    return initPromise
  }

  initPromise = (async () => {
    console.log('[WebLLM] Creating new worker...')
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

    console.log('[WebLLM] Creating engine...')
    try {
      engine = await CreateWebWorkerMLCEngine(worker, modelId, engineConfig)
      console.log('[WebLLM] Engine created successfully!', { hasEngine: !!engine })
      return engine
    } catch (error) {
      // Clean up on failure so a retry can start fresh
      engine = null
      if (worker) {
        worker.terminate()
        worker = null
      }
      console.error('[WebLLM] Failed to create engine:', error)
      throw error
    } finally {
      initPromise = null
    }
  })()

  return initPromise
}

export async function chat(messages, options = {}) {
  if (!engine) {
    console.warn('WebLLM engine is null, attempting to reinitialize...')
    try {
      await initEngine()
    } catch (initError) {
      console.error('Failed to reinitialize engine:', initError)
      throw new Error('AI model failed to load. Please refresh the page.')
    }
  }

  if (!engine) {
    throw new Error('AI model failed to initialize. Please refresh the page.')
  }

  const { stream = true } = options

  try {
    const chunks = await engine.chat.completions.create({
      messages,
      stream,
      ...options,
    })

    if (stream) {
      return chunks
    }
    return chunks.choices[0]?.message?.content ?? ''
  } catch (error) {
    console.error('Chat error:', error)
    throw error
  }
}

export async function unloadEngine() {
  // If init is in progress, wait for it to finish before unloading
  if (initPromise) {
    try {
      await initPromise
    } catch (_) {
      // Init failed — that's fine, we still clean up below
    }
  }

  if (engine) {
    try {
      await engine.unload()
    } catch (err) {
      console.warn('[WebLLM] Error during engine.unload():', err)
    }
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

/**
 * Checks WebGPU in Worker context (where WebLLM runs). Fails fast before model download.
 * Returns { supported: boolean, error?: string }
 */
export async function checkWebGPUInWorker() {
  if (!hasWebGPU()) {
    return { supported: false, error: 'WebGPU API not found' }
  }
  return new Promise((resolve) => {
    const worker = new Worker(
      new URL('../worker/webgpu-check-worker.js', import.meta.url),
      { type: 'module' }
    )
    const timeout = setTimeout(() => {
      worker.terminate()
      resolve({ supported: false, error: 'WebGPU check timed out' })
    }, 5000)
    worker.onmessage = (e) => {
      clearTimeout(timeout)
      worker.terminate()
      resolve(e.data)
    }
    worker.onerror = (err) => {
      clearTimeout(timeout)
      worker.terminate()
      resolve({ supported: false, error: err?.message || 'Worker error' })
    }
  })
}
