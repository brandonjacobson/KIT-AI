function Disclaimer({ onAccept }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">
          Important Disclaimer
        </h1>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p className="text-base">
            This chatbot provides general health information only. It is <strong>not</strong> a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <p className="text-base">
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
          <p className="text-base">
            If you think you may have a medical emergency, call 911 or go to the nearest emergency room immediately.
          </p>
          <p className="text-base">
            By continuing, you acknowledge that you understand these limitations and agree to use this tool for informational purposes only.
          </p>
        </div>
        <button
          onClick={onAccept}
          className="mt-8 w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors min-h-[44px]"
        >
          I Understand
        </button>
      </div>
    </div>
  )
}

export default Disclaimer
