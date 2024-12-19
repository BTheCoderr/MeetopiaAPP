interface ErrorMessageProps {
  message: string
  retry?: () => void
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, retry }) => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="text-red-500 mb-4">{message}</div>
    {retry && (
      <button 
        onClick={retry}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try Again
      </button>
    )}
  </div>
) 