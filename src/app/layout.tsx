import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Claude Todo',
  description: '毎日のタスクをシンプルに管理',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Apply theme before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const s = JSON.parse(localStorage.getItem('claude_todo_v2') || '{}');
                if (s.theme === 'dark') document.documentElement.classList.add('dark');
              } catch(_) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
