import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function Resume() {
  const [resumeData, setResumeData] = useState({ bio: '', education: [], contact: null, stats: [] });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumeRes, projectsRes] = await Promise.all([
          fetch(`${API_BASE}/api/public/resume`),
          fetch(`${API_BASE}/api/public/projects`)
        ]);
        if (resumeRes.ok) setResumeData(await resumeRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
      } catch (error) {
        console.error("Veri çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '500', letterSpacing: '0.05em' }}>
          İçerik Yükleniyor...
        </div>
      </div>
    );
  }

  const displayBio = resumeData.bio;
  const heroTitle = resumeData.hero_title || "Fizik Dünyasını Keşfetmek";
  const heroSub = resumeData.hero_subtitle || "Kuantum Hesaplama & Yüksek Enerji Fiziği Araştırmacısı";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '50px' : '80px', animation: 'fadeIn 0.8s ease' }}>
      
      {/* Premium Hero / Tanıtım Bölümü */}
      <section style={{ 
        position: 'relative', 
        padding: isMobile ? '40px 25px' : '60px 50px', 
        borderRadius: '20px', 
        background: 'linear-gradient(135deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        {/* Dekoratif Kozmik Daireler */}
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,149,110,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '10%', bottom: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,149,110,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '12px', fontWeight: '700', letterSpacing: '0.2em', display: 'block', marginBottom: '12px' }}>
            Hoş Geldiniz
          </span>
          <h2 style={{ color: 'white', fontSize: isMobile ? '28px' : '44px', fontFamily: 'var(--font-serif)', fontWeight: '400', lineHeight: '1.25', marginBottom: '15px' }}>
            {heroTitle}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: isMobile ? '15px' : '18px', maxWidth: '700px', fontWeight: '300', marginBottom: '35px', lineHeight: '1.6' }}>
            {heroSub}
          </p>
          
          {/* İstatistik Göstergeleri */}
          {resumeData.stats && resumeData.stats.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${resumeData.stats.length}, 1fr)`, gap: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px' }}>
              {resumeData.stats.map(stat => (
                <div key={stat.id}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent)', fontFamily: 'var(--font-serif)' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Biyografi / Hakkımda Bölümü */}
      <section id="hakkimda">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: isMobile ? '24px' : '30px', margin: 0 }}>Hakkımda</h2>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>
        
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: isMobile ? '25px' : '45px 50px', 
          borderRadius: '16px', 
          boxShadow: 'var(--shadow-sm)', 
          border: '1px solid var(--border-color)',
          fontSize: isMobile ? '15px' : '16.5px',
          color: 'var(--text-main)',
          lineHeight: '1.9'
        }}>
          <ReactMarkdown>{displayBio}</ReactMarkdown>

          {/* İletişim ve Akademik Bağlantılar */}
          {resumeData.contact && (
            <div style={{ 
              marginTop: '35px', 
              paddingTop: '25px', 
              borderTop: '1px solid var(--border-color)', 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', marginRight: '10px' }}>İletişim & Bağlantılar:</span>
              {resumeData.contact.email && (
                <a href={`mailto:${resumeData.contact.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', backgroundColor: 'var(--bg-main)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '500' }} onMouseOver={(e)=>e.currentTarget.style.borderColor='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.borderColor='var(--border-color)'}>
                  ✉️ E-posta
                </a>
              )}
              {resumeData.contact.scholar && (
                <a href={resumeData.contact.scholar} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', backgroundColor: 'var(--bg-main)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '500' }} onMouseOver={(e)=>e.currentTarget.style.borderColor='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.borderColor='var(--border-color)'}>
                  🎓 Google Scholar
                </a>
              )}
              {resumeData.contact.orcid && (
                <a href={resumeData.contact.orcid} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', backgroundColor: 'var(--bg-main)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '500' }} onMouseOver={(e)=>e.currentTarget.style.borderColor='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.borderColor='var(--border-color)'}>
                  🟢 ORCID iD
                </a>
              )}
              {resumeData.contact.github && (
                <a href={resumeData.contact.github} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', backgroundColor: 'var(--bg-main)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '500' }} onMouseOver={(e)=>e.currentTarget.style.borderColor='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.borderColor='var(--border-color)'}>
                  💻 GitHub
                </a>
              )}
              {resumeData.contact.linkedin && (
                <a href={resumeData.contact.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', backgroundColor: 'var(--bg-main)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '500' }} onMouseOver={(e)=>e.currentTarget.style.borderColor='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.borderColor='var(--border-color)'}>
                  💼 LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Akademik Geçmiş (Zaman Çizelgesi) */}
      {resumeData.education.length > 0 && (
        <section id="egitim">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '30px', margin: 0 }}>Akademik Geçmiş</h2>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          </div>

          <div className="timeline-container">
            {resumeData.education.map((school) => (
              <div key={school.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '18px' : '21px', color: 'var(--primary)' }}>
                      {school.name}
                    </h3>
                    <span style={{ 
                      fontWeight: '600', 
                      color: 'var(--accent)', 
                      backgroundColor: 'var(--accent-light)', 
                      padding: '4px 14px', 
                      borderRadius: '30px', 
                      fontSize: '13px' 
                    }}>
                      {school.year}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontStyle: 'italic', margin: 0 }}>
                    {school.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Çalışmalar & Yayınlar */}
      <section id="calismalar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: isMobile ? '24px' : '30px', margin: 0 }}>Çalışmalar & Yayınlar</h2>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>
        
        {projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="pub-card"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: isMobile ? '20px' : '23px', color: 'var(--primary)' }}>
                    {project.name}
                  </h3>
                  <span style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-light)', 
                    border: '1px solid var(--border-color)', 
                    padding: '3px 10px', 
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    {project.date}
                  </span>
                </div>
                
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '15px', 
                  lineHeight: '1.7', 
                  margin: '0 0 20px 0', 
                  display: '-webkit-box', 
                  WebkitLineClamp: '3', 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden' 
                }}>
                  {project.content.replace(/[#_*~`]/g, '')}
                </p>
                
                <div style={{ 
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                  marginTop: '20px'
                }}>
                  <div style={{ 
                    color: 'var(--accent)', 
                    fontWeight: '600', 
                    fontSize: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    transition: 'gap 0.2s ease'
                  }}
                  className="explore-link"
                  >
                    Çalışmayı İncele <span style={{ transition: 'transform 0.2s' }}>→</span>
                  </div>
                  {project.external_link && (
                    <a 
                      href={project.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '14px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontWeight: '500'
                      }}
                      onMouseOver={(e)=>e.currentTarget.style.color='var(--accent)'}
                      onMouseOut={(e)=>e.currentTarget.style.color='var(--text-muted)'}
                    >
                      Makaleyi Oku (arXiv) ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Henüz bir çalışma veya yayın eklenmemiş.</p>
          </div>
        )}
      </section>

    </div>
  );
}