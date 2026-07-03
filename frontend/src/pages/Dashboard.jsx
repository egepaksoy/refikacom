import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const [backendMessage, setBackendMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ozgecmis'); // Test için varsayılanı projeler yaptık
  const navigate = useNavigate();

  // --- ÖZGEÇMİŞ STATE'LERİ ---
  const [aboutMarkdown, setAboutMarkdown] = useState('');
  const [schools, setSchools] = useState([]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolDept, setNewSchoolDept] = useState('');
  const [newSchoolYear, setNewSchoolYear] = useState('');

  // --- İLETİŞİM & AKADEMİK PROFiLLER STATE'LERİ ---
  const [email, setEmail] = useState('');
  const [scholar, setScholar] = useState('');
  const [orcid, setOrcid] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // --- HERO BANNER STATE'LERİ ---
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [stats, setStats] = useState([]);

  // --- PROJELER STATE'LERİ ---
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null); // Null ise kartlar görünür, doluysa detay sayfası açılır

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const authResponse = await fetch('http://127.0.0.1:8000/api/dashboard-data', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          setBackendMessage(authData.message);

          const resumeResponse = await fetch('http://127.0.0.1:8000/api/resume', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (resumeResponse.ok) {
            const resumeData = await resumeResponse.json();
            setAboutMarkdown(resumeData.bio);
            setSchools(resumeData.education || []);
            setHeroTitle(resumeData.hero_title || '');
            setHeroSubtitle(resumeData.hero_subtitle || '');
            setStats(resumeData.stats || []);
            if (resumeData.contact) {
              setEmail(resumeData.contact.email || '');
              setScholar(resumeData.contact.scholar || '');
              setOrcid(resumeData.contact.orcid || '');
              setGithub(resumeData.contact.github || '');
              setLinkedin(resumeData.contact.linkedin || '');
            }
          }
          
          const projectsResponse = await fetch('http://127.0.0.1:8000/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            if (projectsData.length > 0) setProjects(projectsData);
          }
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error("Sunucuya ulaşılamadı:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  // --- ÖZGEÇMİŞ FONKSİYONLARI ---
  const handleAddSchool = (e) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolYear) return alert('Okul adı ve dönem boş bırakılamaz!');
    setSchools([...schools, { id: Date.now(), name: newSchoolName, department: newSchoolDept, year: newSchoolYear }]);
    setNewSchoolName(''); setNewSchoolDept(''); setNewSchoolYear('');
  };

  const handleRemoveSchool = (id) => setSchools(schools.filter(school => school.id !== id));

  const handleSaveResume = async () => {
    const token = localStorage.getItem('token');
    const resumeData = { 
      bio: aboutMarkdown, 
      education: schools,
      contact: { email, scholar, orcid, github, linkedin },
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      stats: stats
    };
    try {
      const response = await fetch('http://127.0.0.1:8000/api/resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData)
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) { console.error("Hata:", error); }
  };

  // --- PROJE FONKSİYONLARI ---
  const handleCreateNewProject = () => {
    setEditingProject({
      id: Date.now(),
      name: '',
      date: '',
      contributors: '',
      content: '# Yeni Proje Başlığı\nProje detaylarını buraya yazın...',
      gallery: [],
      external_link: ''
    });
  };

  const syncProjectsWithBackend = async (updatedProjects) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProjects)
      });
      if (response.ok) {
        alert('Projeler başarıyla backend\'e kaydedildi!');
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  const handleSaveProject = () => {
    const exists = projects.find(p => p.id === editingProject.id);
    let updatedProjects;
    if (exists) {
      updatedProjects = projects.map(p => p.id === editingProject.id ? editingProject : p);
    } else {
      updatedProjects = [...projects, editingProject];
    }
    
    setProjects(updatedProjects);
    setEditingProject(null);
    syncProjectsWithBackend(updatedProjects); // Backend'e gönder
  };

  const handleDeleteProject = async (id) => {
    if(window.confirm('Bu projeyi silmek istediğine emin misin? Projeye ait tüm görseller de kalıcı olarak silinecek!')) {
      const token = localStorage.getItem('token');
      
      try {
        // Backend'e projeyi ve fiziksel dosyalarını silmesi için özel istek atıyoruz
        const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.ok) {
          // İşlem başarılıysa React arayüzündeki (state) listeyi güncelle
          const updatedProjects = projects.filter(p => p.id !== id);
          setProjects(updatedProjects);
          setEditingProject(null);
        } else {
          alert('Proje sunucudan silinirken bir hata oluştu.');
        }
      } catch (error) {
        console.error("Proje silme hatası:", error);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', editingProject.id); // YENİ: Proje ID'sini arka uca gönderiyoruz

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setEditingProject({
          ...editingProject,
          gallery: [...editingProject.gallery, data.url]
        });
      } else {
        alert("Fotoğraf yüklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Yükleme hatası:", error);
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    const imageUrl = editingProject.gallery[indexToRemove];
    const token = localStorage.getItem('token');

    // 1. Önce backend'den resmi fiziksel olarak silmek için istek atıyoruz
    try {
      const response = await fetch('http://127.0.0.1:8000/api/delete-image', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ image_url: imageUrl })
      });

      if (response.ok) {
        // 2. Backend'den silindiyse, arayüzden (state) de temizle
        setEditingProject({
          ...editingProject,
          gallery: editingProject.gallery.filter((_, index) => index !== indexToRemove)
        });
      } else {
        alert("Görsel sunucudan silinemedi.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- STİLLER ---
  const tabStyle = (tabName) => ({
    padding: '14px 20px', 
    cursor: 'pointer', 
    backgroundColor: activeTab === tabName ? 'rgba(194, 149, 110, 0.1)' : 'transparent',
    color: activeTab === tabName ? 'var(--accent)' : '#94A3B8', 
    border: 'none', 
    borderLeft: activeTab === tabName ? '4px solid var(--accent)' : '4px solid transparent',
    borderRadius: '0 8px 8px 0', 
    textAlign: 'left',
    fontSize: '15px', 
    fontWeight: '500',
    transition: 'all 0.25s ease',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  });

  const inputStyle = { 
    padding: '12px 16px', 
    borderRadius: '10px', 
    border: '1.5px solid var(--border-color)', 
    fontSize: '15px', 
    width: '100%', 
    marginBottom: '20px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'var(--font-sans)',
    backgroundColor: '#F8FAFC'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'var(--font-sans)', margin: 0, overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: '280px', 
        backgroundColor: 'var(--primary)', 
        color: 'white', 
        padding: '40px 0 40px 20px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ paddingRight: '20px', marginBottom: '30px' }}>
          <h2 style={{ 
            color: 'white', 
            fontFamily: 'var(--font-serif)', 
            fontSize: '24px', 
            margin: '0 0 5px 0',
            fontWeight: 'normal'
          }}>
            Refika Öncü
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
            Yönetim Paneli
          </span>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginTop: '20px' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, paddingRight: '20px' }}>
          <button style={tabStyle('ozgecmis')} onClick={() => { setActiveTab('ozgecmis'); setEditingProject(null); }}>
            📝 Özgeçmiş Yönetimi
          </button>
          <button style={tabStyle('projeler')} onClick={() => setActiveTab('projeler')}>
            📁 Proje & Yayınlar
          </button>
          <button style={tabStyle('notlar')} onClick={() => { setActiveTab('notlar'); setEditingProject(null); }}>
            🔬 Not & Soru Yükle
          </button>
        </div>

        <div style={{ paddingRight: '20px' }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%',
              padding: '12px', 
              backgroundColor: 'rgba(244, 63, 94, 0.1)', 
              color: '#F43F5E', 
              border: '1.5px solid rgba(244, 63, 94, 0.2)', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e)=>{ e.currentTarget.style.backgroundColor='#F43F5E'; e.currentTarget.style.color='white'; }}
            onMouseOut={(e)=>{ e.currentTarget.style.backgroundColor='rgba(244, 63, 94, 0.1)'; e.currentTarget.style.color='#F43F5E'; }}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '40px', 
          borderRadius: '20px', 
          boxShadow: 'var(--shadow-sm)', 
          border: '1px solid var(--border-color)',
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          
          {/* ÖZGEÇMİŞ SEKMESİ */}
          {activeTab === 'ozgecmis' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '26px', color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: 'normal' }}>Özgeçmiş Yönetimi</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>Biyografi metninizi markdown kullanarak düzenleyin ve eğitim geçmişinizi güncelleyin.</p>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                {/* Giriş Kartı (Hero Banner) Ayarları */}
                <div style={{ marginBottom: '35px', padding: '25px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1.5px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '17px', color: 'var(--primary)', marginBottom: '15px', fontWeight: '600' }}>🚀 Giriş Paneli (Hero Banner) Ayarları</h3>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Giriş Başlığı (Hero Title)</label>
                      <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px', width: '100%', fontFamily: 'var(--font-sans)', backgroundColor: '#FFFFFF' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} placeholder="Evrenin Kuantum Sırlarını Keşfetmek" />
                    </div>
                    <div style={{ flex: '2 1 450px' }}>
                      <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Giriş Alt Başlığı (Hero Subtitle)</label>
                      <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px', width: '100%', fontFamily: 'var(--font-sans)', backgroundColor: '#FFFFFF' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} placeholder="Kuantum Bilgi Teorisi & Yüksek Enerji Fiziği Üzerine Araştırmalar" />
                    </div>
                  </div>

                  {/* İstatistik Düzenleme Bölümü */}
                  <div style={{ marginTop: '25px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>📊 İstatistik Göstergeleri (Değer & Açıklama)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                      {stats.map((stat, idx) => (
                        <div key={stat.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            value={stat.value} 
                            onChange={(e) => {
                              const updated = [...stats];
                              updated[idx].value = e.target.value;
                              setStats(updated);
                            }} 
                            style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14px', width: '85px', textAlign: 'center', fontWeight: 'bold', fontFamily: 'var(--font-sans)', backgroundColor: '#FFFFFF' }} 
                            placeholder="Örn: 3+" 
                            onFocus={(e)=>e.target.style.borderColor='var(--accent)'} 
                            onBlur={(e)=>e.target.style.borderColor='var(--border-color)'}
                          />
                          <input 
                            type="text" 
                            value={stat.label} 
                            onChange={(e) => {
                              const updated = [...stats];
                              updated[idx].label = e.target.value;
                              setStats(updated);
                            }} 
                            style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14px', flex: 1, fontFamily: 'var(--font-sans)', backgroundColor: '#FFFFFF' }} 
                            placeholder="Örn: Aktif Proje" 
                            onFocus={(e)=>e.target.style.borderColor='var(--accent)'} 
                            onBlur={(e)=>e.target.style.borderColor='var(--border-color)'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '15px', fontWeight: '600' }}>1. Hakkımda Metni (Markdown)</h3>
                <div style={{ display: 'flex', gap: '30px', flex: 1 }}>
                  <textarea 
                    value={aboutMarkdown} 
                    onChange={(e) => setAboutMarkdown(e.target.value)} 
                    style={{ 
                      flex: 1, 
                      padding: '20px', 
                      fontFamily: 'monospace', 
                      fontSize: '15px', 
                      borderRadius: '12px', 
                      border: '1.5px solid var(--border-color)', 
                      resize: 'none',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      transition: 'border-color 0.2s'
                    }} 
                    onFocus={(e)=>e.target.style.borderColor='var(--accent)'}
                    onBlur={(e)=>e.target.style.borderColor='var(--border-color)'}
                  />
                  <div style={{ 
                    flex: 1, 
                    padding: '20px', 
                    border: '1.5px solid var(--border-color)', 
                    borderRadius: '12px', 
                    backgroundColor: '#FFFFFF', 
                    overflowY: 'auto', 
                    fontSize: '15px',
                    lineHeight: '1.8'
                  }}>
                    <ReactMarkdown>{aboutMarkdown}</ReactMarkdown>
                  </div>
                </div>
              </div>

              <hr style={{ border: '0', height: '1px', backgroundColor: 'var(--border-color)', margin: '40px 0' }} />
              
              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '15px', fontWeight: '600' }}>2. Akademik Geçmiş (Okullar)</h3>
                <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 25px 0' }}>
                  {schools.map((s) => (
                    <li key={s.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      backgroundColor: '#F8FAFC', 
                      padding: '16px 24px', 
                      borderRadius: '12px', 
                      marginBottom: '12px', 
                      borderLeft: '4px solid var(--accent)',
                      boxShadow: 'var(--shadow-sm)',
                      borderTop: '1px solid var(--border-color)',
                      borderRight: '1px solid var(--border-color)',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <div>
                        <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>{s.name}</strong>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {s.department || 'Bölüm Belirtilmedi'} <span style={{ color: 'var(--text-light)', marginLeft: '10px' }}>| {s.year}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveSchool(s.id)} 
                        style={{ 
                          backgroundColor: 'rgba(244, 63, 94, 0.1)', 
                          color: '#F43F5E', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '13px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e)=>{e.currentTarget.style.backgroundColor='#F43F5E'; e.currentTarget.style.color='white';}}
                        onMouseOut={(e)=>{e.currentTarget.style.backgroundColor='rgba(244, 63, 94, 0.1)'; e.currentTarget.style.color='#F43F5E';}}
                      >
                        Sil
                      </button>
                    </li>
                  ))}
                </ul>

                <form onSubmit={handleAddSchool} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <input type="text" placeholder="Okul / Enstitü Adı" value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} style={{ padding: '12px 16px', flex: 2, borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} />
                  <input type="text" placeholder="Bölüm / Araştırma Konusu" value={newSchoolDept} onChange={(e) => setNewSchoolDept(e.target.value)} style={{ padding: '12px 16px', flex: 2, borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} />
                  <input type="text" placeholder="Dönem (Örn: 2024 - 2026)" value={newSchoolYear} onChange={(e) => setNewSchoolYear(e.target.value)} style={{ padding: '12px 16px', flex: 1, borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} />
                  <button 
                    type="submit" 
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontWeight: '600',
                      fontSize: '14.5px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e)=>e.currentTarget.style.backgroundColor='var(--primary-hover)'}
                    onMouseOut={(e)=>e.currentTarget.style.backgroundColor='var(--primary)'}
                  >
                    Ekle
                  </button>
                </form>
              </div>

              {/* 3. İletişim ve Akademik Bağlantılar */}
              <hr style={{ border: '0', height: '1px', backgroundColor: 'var(--border-color)', margin: '40px 0' }} />
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '20px', fontWeight: '600' }}>3. İletişim & Akademik Bağlantılar</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>E-posta Adresi</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px', width: '100%', fontFamily: 'var(--font-sans)', backgroundColor: '#F8FAFC' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} placeholder="refika.oncu@tum.de" />
                  </div>
                  <div>
                    <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Google Scholar URL</label>
                    <input type="text" value={scholar} onChange={(e) => setScholar(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px', width: '100%', fontFamily: 'var(--font-sans)', backgroundColor: '#F8FAFC' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} placeholder="https://scholar.google.com/..." />
                  </div>
                  <div>
                    <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>ORCID URL / ID</label>
                    <input type="text" value={orcid} onChange={(e) => setOrcid(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px', width: '100%', fontFamily: 'var(--font-sans)', backgroundColor: '#F8FAFC' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} placeholder="https://orcid.org/..." />
                  </div>
                  <div>
                    <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>GitHub URL</label>
                    <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px', width: '100%', fontFamily: 'var(--font-sans)', backgroundColor: '#F8FAFC' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} placeholder="https://github.com/..." />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>LinkedIn URL</label>
                    <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} style={{ padding: '12px 16px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontSize: '14.5px', width: '100%', fontFamily: 'var(--font-sans)', backgroundColor: '#F8FAFC' }} onFocus={(e)=>e.target.style.borderColor='var(--accent)'} onBlur={(e)=>e.target.style.borderColor='var(--border-color)'} placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px', textAlign: 'right', borderTop: '1px solid var(--border-color)', paddingTop: '25px' }}>
                <button 
                  onClick={handleSaveResume} 
                  style={{ 
                    backgroundColor: 'var(--accent)', 
                    color: 'var(--primary)', 
                    border: 'none', 
                    padding: '14px 35px', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    transition: 'all 0.25s'
                  }}
                  onMouseOver={(e)=>e.currentTarget.style.backgroundColor='var(--accent-hover)'}
                  onMouseOut={(e)=>e.currentTarget.style.backgroundColor='var(--accent)'}
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          )}

          {/* PROJELER SEKMESİ */}
          {activeTab === 'projeler' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* DURUM 1: LİSTE GÖRÜNÜMÜ */}
              {!editingProject ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '26px', color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: 'normal' }}>Çalışmalar & Yayınlar</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>Portfolyonuzdaki makale, araştırma ve projelerin listesi.</p>
                    </div>
                    <button 
                      onClick={handleCreateNewProject} 
                      style={{ 
                        backgroundColor: 'var(--accent)', 
                        color: 'var(--primary)', 
                        border: 'none', 
                        padding: '12px 24px', 
                        borderRadius: '10px', 
                        cursor: 'pointer', 
                        fontSize: '15px', 
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e)=>e.currentTarget.style.backgroundColor='var(--accent-hover)'}
                      onMouseOut={(e)=>e.currentTarget.style.backgroundColor='var(--accent)'}
                    >
                      + Yeni Çalışma Ekle
                    </button>
                  </div>
                  
                  {/* Proje Kartları Izgarası */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {projects.map(proj => (
                      <div 
                        key={proj.id} 
                        onClick={() => setEditingProject(proj)}
                        style={{ 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '12px', 
                          padding: '24px', 
                          cursor: 'pointer', 
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                          boxShadow: 'var(--shadow-sm)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          backgroundColor: '#FFFFFF',
                          position: 'relative'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(194, 149, 110, 0.3)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                      >
                        <div>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: 'var(--primary)', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{proj.name || 'İsimsiz Çalışma'}</h3>
                          <span style={{ fontSize: '13.5px', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>📅 {proj.date || 'Tarih Belirtilmedi'}</span>
                          <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', display: 'block', fontStyle: 'italic' }}>👥 {proj.contributors || 'Katkı Sağlayan Belirtilmedi'}</span>
                        </div>
                        <div style={{ marginTop: '24px', color: 'var(--accent)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Düzenle <span>→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
              
              /* DURUM 2: PROJE DÜZENLEME EKRANI */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: 'normal' }}>
                        {editingProject.name ? "Çalışmayı Düzenle" : "Yeni Çalışma Ekle"}
                      </h2>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>ID: {editingProject.id}</span>
                    </div>
                    <button 
                      onClick={() => setEditingProject(null)} 
                      style={{ 
                        backgroundColor: 'transparent', 
                        color: 'var(--text-muted)', 
                        border: '1.5px solid var(--border-color)', 
                        padding: '8px 20px', 
                        borderRadius: '30px', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e)=>{ e.currentTarget.style.backgroundColor='#F1F5F9'; e.currentTarget.style.color='var(--primary)'; }}
                      onMouseOut={(e)=>{ e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--text-muted)'; }}
                    >
                      ← Listeye Geri Dön
                    </button>
                  </div>

                  {/* Üst Bilgiler */}
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '2 1 400px' }}>
                      <label style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--primary-light)', display: 'block', marginBottom: '8px' }}>Yayın / Çalışma Adı</label>
                      <input style={inputStyle} type="text" value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} placeholder="Örn: Kuantum Dolanıklık Analizi" />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <label style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--primary-light)', display: 'block', marginBottom: '8px' }}>Tarih</label>
                      <input style={inputStyle} type="text" value={editingProject.date} onChange={e => setEditingProject({...editingProject, date: e.target.value})} placeholder="Örn: Haziran 2025" />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--primary-light)', display: 'block', marginBottom: '8px' }}>Katkıda Bulunan Yazarlar</label>
                    <input style={inputStyle} type="text" value={editingProject.contributors} onChange={e => setEditingProject({...editingProject, contributors: e.target.value})} placeholder="Örn: Dr. Refika Öncü, Prof. Dr. X" />
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--primary-light)', display: 'block', marginBottom: '8px' }}>Yayın / Makale Bağlantısı (arXiv, Google Scholar, veya Dergi URL'si)</label>
                    <input style={inputStyle} type="text" value={editingProject.external_link || ''} onChange={e => setEditingProject({...editingProject, external_link: e.target.value})} placeholder="Örn: https://arxiv.org/abs/..." />
                  </div>

                  {/* Markdown İçerik Alanı */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '350px', marginTop: '10px' }}>
                    <label style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--primary-light)', display: 'block', marginBottom: '8px' }}>Detaylı Metin İçeriği (Markdown)</label>
                    <div style={{ display: 'flex', gap: '25px', flex: 1 }}>
                      <textarea 
                        value={editingProject.content} 
                        onChange={e => setEditingProject({...editingProject, content: e.target.value})} 
                        style={{ 
                          flex: 1, 
                          padding: '20px', 
                          fontFamily: 'monospace', 
                          fontSize: '14.5px',
                          borderRadius: '12px', 
                          border: '1.5px solid var(--border-color)', 
                          resize: 'none',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }} 
                        placeholder="# Çalışma Özeti..." 
                        onFocus={(e)=>e.target.style.borderColor='var(--accent)'}
                        onBlur={(e)=>e.target.style.borderColor='var(--border-color)'}
                      />
                      <div style={{ 
                        flex: 1, 
                        padding: '20px', 
                        border: '1.5px solid var(--border-color)', 
                        borderRadius: '12px', 
                        backgroundColor: '#FFFFFF', 
                        overflowY: 'auto',
                        lineHeight: '1.8',
                        fontSize: '15px'
                      }}>
                        <ReactMarkdown>{editingProject.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Resim Galerisi Yükleme Alanı */}
                  <div style={{ 
                    marginTop: '35px', 
                    padding: '30px', 
                    backgroundColor: '#F8FAFC', 
                    borderRadius: '16px', 
                    border: '2px dashed var(--border-color)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px', color: 'var(--primary)' }}>Proje Görselleri & Ekleri</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Buraya çalışmaya ait diyagramları, grafik resimlerini veya ek belgeleri yükleyebilirsiniz.</p>
                    
                    {/* Yükleme Butonu */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '25px' }}>
                      <input 
                        type="file" 
                        id="file-upload"
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                      />
                      <label 
                        htmlFor="file-upload"
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e)=>e.currentTarget.style.backgroundColor='var(--primary-light)'}
                        onMouseOut={(e)=>e.currentTarget.style.backgroundColor='var(--primary)'}
                      >
                        📤 Dosya Seç & Yükle
                      </label>
                    </div>
                    
                    {/* Küçük Resimler (Thumbnails) */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {editingProject.gallery.map((imgUrl, index) => (
                        <div key={index} style={{ 
                          position: 'relative', 
                          width: '140px', 
                          height: '110px', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '8px', 
                          overflow: 'hidden',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          <img src={imgUrl} alt={`Galeri ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            onClick={() => handleRemoveImage(index)} 
                            style={{ 
                              position: 'absolute', 
                              top: '8px', 
                              right: '8px', 
                              backgroundColor: 'rgba(244, 63, 94, 0.9)', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '50%', 
                              width: '24px', 
                              height: '24px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e)=>e.currentTarget.style.backgroundColor='#F43F5E'}
                            onMouseOut={(e)=>e.currentTarget.style.backgroundColor='rgba(244, 63, 94, 0.9)'}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projeyi Kaydet / Sil Butonları */}
                  <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '25px' }}>
                    <button 
                      onClick={() => handleDeleteProject(editingProject.id)} 
                      style={{ 
                        backgroundColor: 'rgba(244, 63, 94, 0.1)', 
                        color: '#F43F5E', 
                        border: 'none', 
                        padding: '12px 24px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e)=>{e.currentTarget.style.backgroundColor='#F43F5E'; e.currentTarget.style.color='white';}}
                      onMouseOut={(e)=>{e.currentTarget.style.backgroundColor='rgba(244, 63, 94, 0.1)'; e.currentTarget.style.color='#F43F5E';}}
                    >
                      🗑️ Çalışmayı Sil
                    </button>
                    <button 
                      onClick={handleSaveProject} 
                      style={{ 
                        backgroundColor: 'var(--accent)', 
                        color: 'var(--primary)', 
                        border: 'none', 
                        padding: '14px 35px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontSize: '15.5px', 
                        fontWeight: '600',
                        transition: 'all 0.25s'
                      }}
                      onMouseOver={(e)=>e.currentTarget.style.backgroundColor='var(--accent-hover)'}
                      onMouseOut={(e)=>e.currentTarget.style.backgroundColor='var(--accent)'}
                    >
                      💾 Çalışmayı Kaydet
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'notlar' && ( 
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', gap: '15px' }}>
              <div style={{ fontSize: '50px' }}>🔬</div>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: 'normal' }}>Ders Notu & Soru Yükleme Paneli</h3>
              <p style={{ margin: 0, fontSize: '14.5px', maxWidth: '400px', textAlign: 'center', lineHeight: '1.6' }}>Bu modül yapım aşamasındadır. Yakında öğrencilerinize veya ziyaretçilerinize yönelik sınav soruları ve ders materyallerini buradan yükleyebileceksiniz.</p>
            </div> 
          )}
        </div>
      </div>
    </div>
  );
}