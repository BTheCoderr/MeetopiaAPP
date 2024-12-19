import ConnectionStatus from './ConnectionStatus'

export default function Header() {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">
          <span className="text-blue-500">Meet</span>
          <span className="text-gray-700">opia</span>
        </h1>
      </div>
      <ConnectionStatus />
    </div>
  )
} 