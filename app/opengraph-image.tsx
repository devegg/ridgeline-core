import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Ridgeline Knows — Operations counsel for small business owners'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #141B26 0%, #1B2430 62%, #3A3630 100%)',
          color: '#F5EFE3',
          fontFamily: 'Georgia, serif',
        }}
      >
        <svg width="700" height="120" viewBox="0 0 700 120" style={{ marginBottom: 28 }}>
          <polyline
            points="10,100 120,45 200,75 330,20 450,65 560,35 690,85"
            fill="none"
            stroke="#E3A87C"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ fontSize: 72, letterSpacing: 6, display: 'flex' }}>RIDGELINE KNOWS</div>
        <div
          style={{
            fontSize: 28,
            marginTop: 22,
            color: '#CBBFA8',
            display: 'flex',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}
        >
          Operations counsel for small business owners
        </div>
        <div
          style={{
            fontSize: 20,
            marginTop: 14,
            color: '#8E867A',
            display: 'flex',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}
        >
          The Lowcountry to Myrtle Beach and beyond
        </div>
      </div>
    ),
    { ...size }
  )
}
