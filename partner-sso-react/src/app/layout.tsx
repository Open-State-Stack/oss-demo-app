import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Partner Demo - Pass SSO',
  description: 'Pass OAuth2 Integration Demo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}