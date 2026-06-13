import { SUPPORT_EMAIL } from '@/lib/site'

export default function ContactEmail() {
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">
      {SUPPORT_EMAIL}
    </a>
  )
}
