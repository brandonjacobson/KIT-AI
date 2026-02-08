import { CreateWebWorkerMLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm'

const DEFAULT_MODEL = 'Llama-3.2-3B-Instruct-q4f32_1-MLC'

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

  const engineConfig = {
    appConfig: {
      ...prebuiltAppConfig,
      useIndexedDBCache: true,
    },
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
