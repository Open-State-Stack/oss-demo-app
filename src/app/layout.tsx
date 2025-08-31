import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OSS Demo App - OAuth Integration',
  description: 'Digital Pass SSO Integration Demo',
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