# 📦 Packing Recorder Lite

Web App สำหรับบันทึกวิดีโอตอนแพ็คสินค้า เพื่อเป็นหลักฐานย้อนหลัง โดยไม่ต้องลงโปรแกรมหนักๆ ทำงานผ่าน Google Chrome

## ✨ ฟีเจอร์

- 📷 บันทึกวิดีโอจาก Webcam (1280x720)
- 📝 ใส่เลข Order Number (ยิง Barcode ได้)
- 🎬 ฝังเลข Order และเวลาปัจจุบันลงในวิดีโอ (Overlay)
- ☁️ อัปโหลดวิดีโอขึ้น Google Shared Drive อัตโนมัติ พร้อมจัดเรียงตามโฟลเดอร์ วัน/เดือน/ปี
- 🗄 ค้นหาและดูประวัติย้อนหลังได้จากในตัวแอป (ข้อมูลเก็บใน IndexedDB ของเบราว์เซอร์)

## 🚀 วิธีใช้งานเบื้องต้น

1. รัน Local Server ด้วย Python หรือ http-server:
   ```bash
   # หากใช้ Python
   python -m http.server 8000
   
   # หรือหากมี Node.js
   npx http-server . -p 8000
   ```
2. เปิดเบราว์เซอร์ Google Chrome ไปที่ `http://localhost:8000`
3. เบราว์เซอร์จะขออนุญาตใช้งานกล้อง (Camera Permission) ให้กด **Allow**
4. คลิก **Sign In to Google** เพื่อให้แอปมีสิทธิ์อัปโหลดไฟล์ขึ้น Google Drive
5. กรอกหรือยิง Barcode รหัส `Order Number`
6. กดปุ่ม **Start Recording** และเริ่มแพ็คสินค้า
7. แพ็คเสร็จให้กด **Stop Recording**
8. ระบบจะอัปโหลดวิดีโอขึ้น Google Drive ให้อัตโนมัติ พร้อมขึ้นประวัติในแถบด้านขวา

## ⚙️ การตั้งค่า Google Drive API

แอปพลิเคชันนี้ต้องใช้ **Google Client ID** สำหรับอัปโหลดไฟล์
กรุณานำ Client ID ของคุณมาใส่ในไฟล์ `src/drive.js`:

```javascript
// ในไฟล์ src/drive.js
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; 
```

**โฟลเดอร์ปลายทาง (Root Folder):**
ตั้งค่าไว้ที่ Shared Folder `PackingRecorder`
(Folder ID: `1uKbeRbBONdq1aFMwIs94yfd4WXwG_fCj`)

---
*พัฒนาเพื่อใช้งานชั่วคราว (Phase 0) ก่อนย้ายระบบไปใช้ BigSeller แบบเต็มรูปแบบ*
