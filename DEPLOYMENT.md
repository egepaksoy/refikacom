# Dr. Refika Öncü Portfolyo Dağıtım (Deployment) Kılavuzu

Projenizi canlıya (production) alabilmeniz için gerekli kod düzenlemeleri tamamlandı, test edildi ve GitHub deposuna pushlandı. 

Aşağıdaki adımları sırasıyla takip ederek uygulamanızı canlıya alabilirsiniz:

---

## 1. BACKEND DEPLOYMENT: Render (FastAPI)

Render üzerinde backend'inizi çalıştırmak ve verilerin (özgeçmiş, projeler ve resimler) silinmemesi için bir **Persistent Disk** (Kalıcı Disk) kurmak üzere şu adımları izleyin:

### Adım A: Web Service Oluşturma
1. [Render Dashboard](https://dashboard.render.com/) sayfasına gidin ve giriş yapın.
2. **New +** butonuna tıklayarak **Web Service** seçeneğini seçin.
3. GitHub deponuzu (`refikacom`) Render hesabınıza bağlayın ve bu depoyu seçin.

### Adım B: Web Service Ayarları
Web servisi oluştururken form alanlarını aşağıdaki gibi doldurun:
- **Name:** `refikacom-backend` (veya tercih ettiğiniz bir isim)
- **Region:** Size en yakın olanı seçebilirsiniz (örn: `Frankfurt (EU)`)
- **Branch:** `master`
- **Root Directory:** `backend` *(Çok önemli! Backend klasörünün içinde çalışmasını sağlar)*
- **Runtime:** `Python`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Plan:** `Free` (veya bütçenize göre ücretli plan)

### Adım C: Çevre Değişkenleri (Environment Variables)
Sayfanın altındaki **Advanced** sekmesine tıklayın ve aşağıdaki Environment Variables alanlarını ekleyin:
1. `DATA_DIR` -> `/data` *(Veritabanı JSON ve uploads klasörünü diske yönlendirir)*
2. `ALLOWED_ORIGINS` -> `https://egepaksoy.github.io` *(Frontend sitenizin CORS izni)*

### Adım D: Kalıcı Disk Tanımlama (Persistent Disk)
Render Free planda disk desteği vermez, ancak **Starter** veya üzeri bir plan seçtiyseniz (veya verilerin Render her yeniden başladığında sıfırlanmasını istemiyorsanız) şu diski tanımlayın:
- **Web Service -> Disks** sekmesine gidin.
- **Add Disk** butonuna tıklayın.
- **Name:** `backend-storage`
- **Mount Path:** `/data` *(DATA_DIR değişkeni ile eşleşmelidir)*
- **Size:** `1 GB` (veya üzeri)

> [!NOTE]
> Free planda disk eklenemediği için admin panelinden yapacağınız güncellemeler sunucu her yeniden başladığında (günde en az bir kere) başlangıçtaki varsayılan JSON verilerine geri dönecektir. Kalıcılık için Starter ($7/ay) diskli plan önerilir.

---

## 2. FRONTEND DEPLOYMENT: GitHub Pages

Vite projenizi GitHub Pages üzerinde yayınlamak için depo dizininde bir terminal açarak şu adımları gerçekleştirin:

### Adım A: Canlı API Adresini Tanımlama
Derleme (build) sırasında frontend'in Render'daki backend adresinize istek atabilmesi için bir `.env.production` dosyası oluşturun veya build komutunu environment variable ile çalıştırın.

Frontend dizinindeyken (`c:\Users\egepa\refikacom\frontend`) build ve deploy işlemini başlatmak için:

1. Render'daki backend url'nizi kopyalayın (Örn: `https://refikacom-backend.onrender.com`).
2. Terminalde `frontend` dizinine geçin ve aşağıdaki komutla deploy işlemini tetikleyin:
   ```powershell
   $env:VITE_API_URL="https://refikacom-backend.onrender.com"; npm run deploy
   ```
   *(Eğer PowerShell yerine standart CMD kullanıyorsanız command: `set VITE_API_URL=https://refikacom-backend.onrender.com && npm run deploy`)*

Bu komut:
- Otomatik olarak `npm run build` komutunu çalıştırarak relative path ile `/dist` klasörünü derler.
- Ardından derlenen bu klasörü GitHub deponuzdaki `gh-pages` dalına (branch) otomatik olarak pushlar.

### Adım B: GitHub Depo Ayarlarını Yapma
1. GitHub deponuzun tarayıcı sayfasına gidin (`github.com/egepaksoy/refikacom`).
2. **Settings** -> **Pages** sekmesine gelin.
3. **Build and deployment** başlığı altında:
   - **Source:** `Deploy from a branch` seçin.
   - **Branch:** `gh-pages` ve klasör olarak `/ (root)` seçerek **Save** butonuna tıklayın.

Birkaç dakika içinde portfolyo siteniz **`https://egepaksoy.github.io/refikacom/`** adresinde yayında olacaktır!
