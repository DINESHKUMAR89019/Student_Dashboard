import './globals.css'

export const metadata = {
  title: 'Student Learning Tracker - Academic Progress Dashboard',
  description: 'A comprehensive platform for students and teachers to track academic progress, manage courses, and monitor grades in real-time.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
