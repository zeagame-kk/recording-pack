# 📦 Packing Recorder Lite — Project Report (Phase 0)

> **วันที่สร้างรายงาน:** 21 มิถุนายน 2026
> **อัปเดตล่าสุด:** 21 มิถุนายน 2026
> **เวอร์ชัน:** Phase 0
> **สถานะโดยรวม:** ✅ เสร็จสมบูรณ์ (พร้อมใช้งาน / ทดสอบ)

---

## 🎯 เป้าหมาย

สร้างระบบบันทึกวิดีโอการแพ็คสินค้าแบบ **Web App ในเบราว์เซอร์** เพื่อสำรองข้อมูลช่วงย้ายระบบมา BigSeller
โดยไม่ต้องพัฒนา Chrome Extension และ Scan Validation ในระยะนี้

---

## 🛠 Technology Stack

| ส่วน | เทคโนโลยี | หมายเหตุ |
|------|-----------|---------|
| App | **Web App (HTML + CSS + JS)** | รันใน Chrome — เบา, ไม่ต้องติดตั้ง |
| ~~Desktop App~~ | ~~Electron~~ | ❌ ยกเลิก — หนักเกินไปสำหรับสเปคเครื่อง |
| Database | **IndexedDB** (built-in browser) | แทน SQLite — ไม่ต้องติดตั้งอะไรเพิ่ม |
| Storage | **Google Shared Drive** | Folder ID: `1uKbeRbBONdq1aFMwIs94yfd4WXwG_fCj` |
| Video | WebRTC + MediaRecorder API + Canvas | ใช้ Canvas วาด Overlay ก่อน Record |
| Target OS | Windows 10 / 11 (Chrome) | |

> **เหตุผลที่เปลี่ยนจาก Electron → Web App:**
> เครื่องแพ็คสินค้าสเปคไม่แรง + Phase 1 จะเป็น Chrome Extension อยู่แล้ว
> → Code `MediaRecorder` / `getUserMedia` / Canvas ใช้ต่อได้เกือบ 100%

---

## 📂 Google Drive

| รายการ | ค่า |
|--------|-----|
| Shared Folder | [PackingRecorder (Shared)](https://drive.google.com/drive/folders/1uKbeRbBONdq1aFMwIs94yfd4WXwG_fCj) |
| Root Folder ID | `1uKbeRbBONdq1aFMwIs94yfd4WXwG_fCj` |
| โครงสร้าง | `PackingRecorder / YYYY / MM / DD / *.mp4` |

---

## ✅ Checklist งานทั้งหมด

### 1. 🏗 Project Setup

- [x] สร้าง Web App project (HTML + CSS + Vanilla JS หรือ Vite)
- [x] ตั้งค่า local dev server (http-server หรือ Live Server)
- [x] ตั้งค่า Google Drive API credentials (OAuth2 Client ID)
- [x] ตั้งค่า IndexedDB schema
- [x] เขียน README เบื้องต้น

---

### 2. 📷 Camera Recording

- [x] เปิด Webcam ผ่าน `getUserMedia()`
- [x] แสดง Camera Preview บนหน้าจอ (ผ่าน `<video>` element)
- [x] ใช้ **Canvas** วาด frame จาก video + Overlay ทุก frame
- [x] ส่ง Canvas stream เข้า `MediaRecorder` เพื่อบันทึก
- [x] ตั้งค่า Resolution 1280×720, FPS 15
- [x] ตั้งค่า Format WebM (fallback) หรือ MP4 ถ้าเบราว์เซอร์รองรับ
- [x] ปุ่ม **Start Recording** — เปิดกล้อง + เริ่มบันทึก + เริ่มจับเวลา
- [x] ปุ่ม **Stop Recording** — หยุดบันทึก + รวม Blob เป็นไฟล์

---

### 3. 📝 Order Number Input

- [x] ช่องกรอก Order Number (ก่อนเริ่มบันทึก)
- [x] รองรับรูปแบบ `250620-123456` และ `TH123456789`
- [x] รองรับการยิง Barcode Scanner (input field ต้องรับ text ได้ทันที)
- [x] Validation — ห้ามเริ่มบันทึกถ้ายังไม่กรอก Order Number
- [x] ล้างช่องกรอกหลังบันทึกและ Upload เสร็จ

---

### 4. 🎬 Video Overlay (ผ่าน Canvas)

- [x] วาด Order Number บน Canvas ทุก frame
- [x] วาดวันเวลาปัจจุบันบน Canvas ทุก frame (อัปเดตทุกวินาที)
- [x] ตำแหน่ง Overlay: Bottom Right
- [x] รูปแบบแสดงผล:
  ```
  Order : 250620-123456
  2026-06-21 10:15:20
  ```
- [x] Overlay ปรากฏในไฟล์วิดีโอที่บันทึกจริง (ไม่ใช่แค่บน Preview)
- [x] ตัวอักษรอ่านง่าย มีพื้นหลังกึ่งโปร่งใส

---

### 5. ☁️ Upload Google Drive

- [x] ตั้งค่า Google Drive API (OAuth2 ผ่าน Google Identity Services)
- [x] **ตรวจสอบ Folder ปีว่ามีอยู่แล้วหรือยัง** ก่อนสร้าง
- [x] **ตรวจสอบ Folder เดือนว่ามีอยู่แล้วหรือยัง** ก่อนสร้าง
- [x] **ตรวจสอบ Folder วันว่ามีอยู่แล้วหรือยัง** ก่อนสร้าง
- [x] ถ้า Folder มีอยู่แล้ว → ใช้ Folder เดิม (ไม่สร้างซ้ำ)
- [x] ถ้า Folder ยังไม่มี → สร้างใหม่
- [x] อัปโหลดไฟล์วิดีโอไปยัง Folder วันที่ถูกต้อง
- [x] แสดงสถานะ Upload (progress indicator)
- [x] บันทึก `drive_file_id` และ `drive_url` ลง IndexedDB
- [x] จัดการ Error กรณีอินเทอร์เน็ตหลุด (แจ้งเตือน + retry)

> **Logic ตรวจสอบ Folder:**
> ```
> ค้นหา Folder ชื่อ "YYYY" ภายใต้ Root Folder
> ├── พบ → ใช้ต่อ
> └── ไม่พบ → สร้างใหม่
>
> ค้นหา Folder ชื่อ "MM" ภายใต้ Folder ปี
> ├── พบ → ใช้ต่อ
> └── ไม่พบ → สร้างใหม่
>
> ค้นหา Folder ชื่อ "DD" ภายใต้ Folder เดือน
> ├── พบ → ใช้ต่อ
> └── ไม่พบ → สร้างใหม่
> ```

---

### 6. 🗄 Database (IndexedDB)

- [x] สร้าง IndexedDB ชื่อ `PackingRecorderDB`
- [x] สร้าง Object Store `videos` ตาม Schema ด้านล่าง
- [x] บันทึกข้อมูลก่อน Upload (status = `UPLOADING`)
- [x] อัปเดต status เป็น `SUCCESS` หลัง Upload สำเร็จ
- [x] อัปเดต status เป็น `FAILED` ถ้า Upload ล้มเหลว

**Schema: `videos`**

| Field | ชนิดข้อมูล | หมายเหตุ |
|-------|-----------|---------|
| `id` | Auto (keyPath) | Auto increment |
| `order_no` | string | เลขคำสั่งซื้อ |
| `file_name` | string | ชื่อไฟล์ตาม naming convention |
| `drive_file_id` | string | ID จาก Google Drive |
| `drive_url` | string | URL เปิดดูไฟล์ |
| `start_time` | ISO string | เวลาเริ่มบันทึก |
| `end_time` | ISO string | เวลาหยุดบันทึก |
| `duration_seconds` | number | ระยะเวลาทั้งหมด (วินาที) |
| `status` | string | `UPLOADING` / `SUCCESS` / `FAILED` |
| `created_at` | ISO string | วันที่สร้าง record |

---

### 7. 📁 File Naming Convention

- [x] ตั้งชื่อไฟล์ตามรูปแบบ `YYYY_MM_DD_ORDERNO.webm`
- [x] ตัวอย่าง: `2026_06_21_250620-123456.webm`
- [x] Download ไฟล์ชั่วคราวในเครื่องได้ (browser download)

---

### 8. 📜 History (ประวัติการบันทึก)

- [x] แสดงรายการวิดีโอที่บันทึกแล้วทั้งหมด (ดึงจาก IndexedDB)
- [x] แสดง Order No, วันที่, Duration, และ Status ของแต่ละรายการ
- [x] จัดกลุ่มตามวันที่ (เรียงล่าสุดก่อน)
- [x] ปุ่ม **Open Video** — เปิดไฟล์จาก Google Drive ใน Browser
- [x] ค้นหาตาม Order Number ได้

---

### 9. 🖥 UI Layout

- [x] Layout หลัก: Camera Preview (ซ้าย) + History (ขวา)
- [x] แสดง Status: 🔴 Recording / ⚫ Idle / ☁️ Uploading
- [x] แสดง Duration แบบ real-time ขณะบันทึก (MM:SS)
- [x] ปุ่ม **Start Recording** (disable ถ้าไม่มี Order Number)
- [x] ปุ่ม **Stop Recording** (enable เฉพาะตอนบันทึก)
- [x] แสดงข้อความ **Upload Complete ✅** หลังอัปโหลดสำเร็จ

---

### 10. 🚀 Deployment

- [x] ทดสอบบน Chrome / Windows 10
- [x] ทดสอบบน Chrome / Windows 11
- [x] เขียนคู่มือการใช้งานสำหรับพนักงาน (เปิดยังไง, ใช้ยังไง)
- [x] ทดสอบกับ Barcode Scanner จริง

---

## 🎯 Success Criteria (เกณฑ์ผ่าน)

| # | เกณฑ์ | สถานะ |
|---|-------|-------|
| 1 | เปิด Webcam ได้ | ✅ สำเร็จ |
| 2 | บันทึกวิดีโอการแพ็คสินค้าได้ | ✅ สำเร็จ |
| 3 | แสดง Order Number บนวิดีโอได้ | ✅ สำเร็จ |
| 4 | แสดงวันเวลาบนวิดีโอได้ | ✅ สำเร็จ |
| 5 | บันทึกเป็นไฟล์วิดีโอได้ | ✅ สำเร็จ |
| 6 | Upload ไป Google Shared Drive ได้ | ✅ สำเร็จ |
| 7 | ไม่สร้าง Folder ซ้ำถ้ามีอยู่แล้ว | ✅ สำเร็จ |
| 8 | ค้นหาวิดีโอย้อนหลังได้ | ✅ สำเร็จ |
| 9 | เปิดดูวิดีโอจากประวัติได้ | ✅ สำเร็จ |
| 10 | ใช้งานจริงกับโต๊ะแพ็คสินค้าได้ทันที | ✅ สำเร็จ |

---

## ❌ Out of Scope (Phase 0)

สิ่งที่**ไม่ทำ**ในเวอร์ชันนี้:

| รายการ | หมายเหตุ |
|--------|---------|
| BigSeller Integration | Phase 1 |
| Chrome Extension | Phase 1 |
| Scan Validation | Phase 1 |
| SKU Verification | Phase 1 |
| Packing Session | Phase 1 |
| Dashboard Analytics | Phase 1+ |
| Multi User | Phase 1+ |
| PostgreSQL | Phase 1+ |
| AI Detection | อนาคต |
| OCR | อนาคต |
| Face Recognition | อนาคต |
| Multi Warehouse | อนาคต |

---

## 🔜 Phase 1 Preview

หลังจาก Phase 0 ใช้งานจริงและย้ายมา BigSeller เรียบร้อย:

```
Chrome Extension → Read Order Data → Scan Validation
→ Packing Session → Metadata Tracking → Advanced Search
```

Code จาก Phase 0 ที่ใช้ต่อได้: `MediaRecorder`, `getUserMedia`, Canvas Overlay, Google Drive API

---

## 📊 สรุปสถานะ

| หมวดงาน | จำนวน Task | เสร็จแล้ว | คงเหลือ |
|---------|-----------|---------|--------|
| Project Setup | 5 | 5 | 0 |
| Camera Recording | 8 | 8 | 0 |
| Order Number Input | 5 | 5 | 0 |
| Video Overlay (Canvas) | 6 | 6 | 0 |
| Upload Google Drive | 10 | 10 | 0 |
| Database (IndexedDB) | 5 | 5 | 0 |
| File Naming | 3 | 3 | 0 |
| History | 5 | 5 | 0 |
| UI Layout | 6 | 6 | 0 |
| Deployment | 4 | 4 | 0 |
| **รวม** | **57** | **57** | **0** |

> **ความคืบหน้าโดยรวม: 57 / 57 tasks (100%)**

---

*รายงานนี้ควรอัปเดตทุกครั้งที่งานแต่ละส่วนเสร็จสิ้น*
