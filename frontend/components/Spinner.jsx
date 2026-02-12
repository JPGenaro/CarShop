import React from 'react'

export default function Spinner({ size = 6 }) {
  const s = `${size}rem`
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin text-orange-400"
      style={{ width: s, height: s }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
