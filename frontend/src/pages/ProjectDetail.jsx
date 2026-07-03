import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/projects`);
        if (response.ok) {
          const allProjects = await response.json();
          const foundProject = allProjects.find(p => p.id.toString() === id);
          setProject(foundProject);
        }
      } catch (error) {
        console.error("Veri çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '500' }}>Yükleniyor...</div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: 'var(--text-muted)' }}>
        Proje bulunamadı.
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.6s ease' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          backgroundColor: 'transparent', 
          color: 'var(--accent)', 
          border: '1px solid var(--accent)', 
          padding: '10px 22px', 
          borderRadius: '30px', 
          cursor: 'pointer', 
          fontSize: '14px', 
          fontWeight: '600',
          transition: 'all 0.25s ease', 
          marginBottom: '40px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.color = 'white'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--accent)'; }}
      >
        ← Ana Sayfaya Dön
      </button>

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ textAlign: 'left', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '30px' }}>
          <h1 style={{ 
            color: 'var(--primary)', 
            fontFamily: 'var(--font-serif)', 
            fontSize: isMobile ? '32px' : '44px', 
            margin: '0 0 15px 0', 
            lineHeight: '1.25',
            fontWeight: '400'
          }}>
            {project.name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: 'var(--text-muted)', fontSize: '14px', alignItems: 'center' }}>
            <span>📅 {project.date}</span>
            {project.contributors && <span>👥 {project.contributors}</span>}
          </div>
          {project.external_link && (
            <div style={{ marginTop: '20px' }}>
              <a 
                href={project.external_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  backgroundColor: 'var(--accent)', 
                  color: 'var(--primary)', 
                  padding: '8px 20px', 
                  borderRadius: '30px', 
                  cursor: 'pointer', 
                  fontSize: '13.5px', 
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.25s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                📄 Makaleyi Oku (arXiv / Dergi) ↗
              </a>
            </div>
          )}
        </div>

        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: isMobile ? '25px' : '45px 50px', 
          borderRadius: '16px', 
          boxShadow: 'var(--shadow-sm)', 
          border: '1px solid rgba(226, 232, 240, 0.8)',
          lineHeight: '1.9', 
          fontSize: '16.5px', 
          color: 'var(--text-main)', 
          overflowWrap: 'break-word', 
          marginBottom: '50px' 
        }}>
          <ReactMarkdown>{project.content}</ReactMarkdown>
        </div>

        {project.gallery && project.gallery.length > 0 && (
          <div style={{ marginTop: '50px' }}>
            <h3 style={{ 
              color: 'var(--primary)', 
              fontFamily: 'var(--font-serif)', 
              fontSize: '24px', 
              borderBottom: '1px solid var(--accent)', 
              paddingBottom: '10px', 
              marginBottom: '25px',
              fontWeight: '400'
            }}>
              Ekler & Görseller
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {project.gallery.map((imgUrl, idx) => (
                <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease' }} onMouseOver={(e)=>e.currentTarget.style.transform='scale(1.02)'} onMouseOut={(e)=>e.currentTarget.style.transform='scale(1)'}>
                  <img src={imgUrl} alt={`${project.name} görsel ${idx + 1}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}