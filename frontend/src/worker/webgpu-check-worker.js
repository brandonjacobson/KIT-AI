// Tests WebGPU in Worker context (where WebLLM runs).
// Reports back to main thread so we can fail fast before downloading the model.
(async () => {
  try {
    if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
      self.postMessage({ supported: false, error: 'WebGPU API not found' })
      return
    }
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      self.postMessage({ supported: false, error: 'No WebGPU adapter available' })
      return
    }
    self.postMessage({ supported: true })
  } catch (err) {
    self.postMessage({ supported: false, error: err?.message || String(err) })
  }
})()
