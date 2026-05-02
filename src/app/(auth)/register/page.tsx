import { redirect } from 'next/navigation'

// Registration is handled on the login page via wallet connect
export default function RegisterPage() {
  redirect('/login')
}
