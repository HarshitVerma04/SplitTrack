import { Component, type ErrorInfo, type PropsWithChildren } from 'react'

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SplitTrack] Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-[#f8f9fa] px-4 dark:bg-[#191c1d]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-[0px_24px_48px_rgba(40,16,78,0.08)] dark:bg-[#232627]">
            <h1 className="font-[Manrope] text-2xl font-extrabold tracking-tight text-[#4c1b87] dark:text-[#d8baff]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-[#4b4451] dark:text-[#cac4cf]">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="mt-6 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              Return Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
