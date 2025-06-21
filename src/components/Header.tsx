import ConnectionStatus from './ConnectionStatus'
import Logo from './Logo'

export default function Header() {
  return (
    <div className="flex items-center justify-between w-full">
      <Logo size="sm" isDarkTheme={false} />
      <ConnectionStatus />
    </div>
  )
} 