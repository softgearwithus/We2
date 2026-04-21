import { ImageResponse } from 'next/og';
import { getSeoPageBySlug } from '@/app/lib/seo-pages';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const heroHeadline = searchParams.get('headline');
    const heroSpan = searchParams.get('span');
    
    let title = heroHeadline || 'The #1 AI Interview Platform ';
    let highlight = heroSpan || 'for Modern Teams';
    
    if (slug) {
      const pageData = getSeoPageBySlug(slug);
      if (pageData) {
        title = pageData.heroHeadline;
        highlight = pageData.heroHeadlineSpan;
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#efeff1',
            padding: '40px',
            border: '24px solid #202b20',
          }}
        >
          {/* Logo */}
          <div style={{ position: 'absolute', top: 60, left: 60, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: '#202b20', letterSpacing: '-0.05em' }}>emble.</span>
          </div>

          {/* Brutalist Hero Box Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              backgroundColor: 'white',
              border: '12px solid #202b20',
              padding: '80px',
              boxShadow: '24px 24px 0px 0px #ffa116',
              maxWidth: '90%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 80, fontWeight: 800, color: '#202b20', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              <span>{title}</span>
              <span 
                style={{ 
                  backgroundColor: '#ffa116', 
                  color: '#202b20', 
                  padding: '10px 30px', 
                  border: '6px solid #202b20', 
                  boxShadow: '12px 12px 0px 0px #202b20',
                  marginTop: '20px',
                  display: 'flex'
                }}>
                {highlight}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '60px', borderTop: '4px solid #efeff1', paddingTop: '40px', width: '100%' }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: '#202b20', opacity: 0.8 }}>emble.in/ai-interviews</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
