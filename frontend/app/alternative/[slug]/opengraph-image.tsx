import { ImageResponse } from 'next/og';
import { getSeoPageBySlug } from '@/app/lib/seo-pages';

export const runtime = 'edge';

export const alt = 'Emble vs Competitor Comparison';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const pageData = getSeoPageBySlug(params.slug);
  
  const rawName = params.slug.split('-')[0];
  const competitorName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  if (!pageData) {
    return new Response('Not Found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#1a2b3b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              padding: '40px 60px',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ fontSize: 32, color: '#64748b', marginBottom: '10px' }}>Legacy Code Testing</span>
            <span>{competitorName}</span>
          </div>

          <div style={{ fontSize: 48, fontWeight: 900, color: '#94a3b8' }}>VS</div>

          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#556B2F', // Emble Olive Green
              padding: '40px 60px',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(85, 107, 47, 0.3)',
            }}
          >
            <span style={{ fontSize: 32, color: '#e2e8f0', marginBottom: '10px' }}>Voice AI Interviewer</span>
            <span>emble.in</span>
          </div>
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#1a2b3b',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-2px',
          }}
        >
          {pageData.title.split('|')[0]}
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#475569',
            marginTop: '24px',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          {pageData.subDescription.substring(0, 100)}...
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
