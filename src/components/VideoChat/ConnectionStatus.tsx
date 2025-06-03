interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected'
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const colors = {
    connecting: 'bg-yellow-500',
    connected: 'bg-green-500',
    disconnected: 'bg-red-500'
  }

  return (
    <div className={`px-3 py-1 rounded-full ${colors[status]} text-white text-sm`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
} 