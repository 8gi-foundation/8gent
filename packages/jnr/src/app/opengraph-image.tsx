import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '8gent Jr. - No more gatekeeping. A voice for every kid.';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFF8F0',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 96,
            fontWeight: 700,
            color: '#1A1612',
            letterSpacing: '-0.03em',
          }}
        >
          <span>8gent Jr</span>
          <span style={{ color: '#E8610A' }}>.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: '#5C534A',
            marginTop: 24,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 400,
          }}
        >
          No more gatekeeping. A voice for every kid.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 20,
            color: '#9C9389',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <span>8gentjr.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
