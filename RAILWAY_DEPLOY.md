# Panduan Deploy ke Railway

## Persiapan

Pastikan Anda sudah memiliki:
1. Akun Railway (https://railway.app)
2. Repository GitHub yang sudah di-push
3. MongoDB Atlas cluster yang aktif

---

## Langkah 1: Deploy Backend

### 1.1 Buat Project Baru di Railway
1. Login ke Railway Dashboard
2. Klik **"New Project"** → **"Deploy from GitHub repo"**
3. Pilih repository `task-manager-ta`
4. Pilih folder `backend` sebagai root directory

### 1.2 Set Environment Variables
Di Railway Dashboard, buka tab **Variables** dan tambahkan:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/taskmanager` |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this` |
| `PORT` | (biarkan kosong, Railway set otomatis) |
| `FRONTEND_URL` | (set setelah deploy frontend) |

### 1.3 Deploy
1. Railway akan otomatis detect Node.js dan menjalankan `npm install`
2. Kemudian menjalankan `npm start`
3. Catat URL yang diberikan Railway (contoh: `https://task-manager-backend-xxx.up.railway.app`)

### 1.4 Verifikasi
Buka URL: `https://your-backend-url.up.railway.app/api/health`
Seharusnya menampilkan: `{"ok":true,"message":"API is running"}`

---

## Langkah 2: Deploy Frontend

### 2.1 Buat Service Baru
1. Di project yang sama, klik **"New Service"** → **"GitHub Repo"**
2. Pilih repository yang sama
3. Pilih folder `vite-project` sebagai root directory

### 2.2 Set Environment Variables
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend-url.up.railway.app/api` |

**PENTING**: Ganti `your-backend-url` dengan URL backend dari langkah 1.3

### 2.3 Build Settings
Railway akan otomatis menjalankan:
- `npm install`
- `npm run build`
- `npm run preview`

### 2.4 Catat URL Frontend
Setelah deploy, catat URL frontend (contoh: `https://task-manager-frontend-xxx.up.railway.app`)

---

## Langkah 3: Update CORS Backend

1. Kembali ke service backend di Railway
2. Tambah/update environment variable:
   - `FRONTEND_URL` = `https://your-frontend-url.up.railway.app`
3. Service akan otomatis restart

---

## Langkah 4: Testing

1. Buka URL frontend di browser
2. Coba register akun baru
3. Login dengan akun yang dibuat
4. Test fitur CRUD tasks dan categories

---

## Troubleshooting

### Error: CORS blocked
- Pastikan `FRONTEND_URL` di backend sudah benar
- Restart service backend setelah update environment variable

### Error: Cannot connect to database
- Pastikan IP address Railway sudah di-whitelist di MongoDB Atlas
- Di MongoDB Atlas, pilih **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)

### Error: 502 Bad Gateway
- Cek logs di Railway Dashboard
- Pastikan `start` script ada di package.json

### Frontend tidak load data
- Pastikan `VITE_API_URL` sudah benar
- Periksa browser console untuk error

---

## Struktur Deployment

```
Railway Project
├── Backend Service (task-manager-backend)
│   ├── Source: /backend
│   ├── Start: npm start
│   └── Port: AUTO
│
└── Frontend Service (task-manager-frontend)
    ├── Source: /vite-project
    ├── Build: npm run build
    └── Start: npm run preview
```

---

## Environment Variables Summary

### Backend
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://frontend-url.up.railway.app
```

### Frontend
```
VITE_API_URL=https://backend-url.up.railway.app/api
```
