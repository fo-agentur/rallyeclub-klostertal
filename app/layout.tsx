import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rallyeclub Klostertal',
  description: 'Motorsport, Leidenschaft, Events im Klostertal, Vorarlberg.',
}

export const viewport = {
  themeColor: '#0A0A0F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`scroll-smooth ${inter.variable} ${orbitron.variable}`}>
      <body className="bg-rally-bg font-sans text-rally-muted antialiased overflow-x-hidden selection:bg-rally-accent/40 selection:text-white">
        {children}
      </body>
    </html>
  )
}
