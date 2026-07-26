# 📦 คู่มือติดตั้งและใช้งาน Packing Recorder (Chrome Extension v2.1.0)

ส่วนเสริม (Chrome Extension) สำหรับช่วยบันทึกวิดีโอหลักฐานการแพ็คสินค้า ฝังลายน้ำเรียลไทม์ และอัปโหลดไฟล์ขึ้น **Google Shared Drive** อัตโนมัติ โดยเชื่อมต่อตรงกับหน้าจอ **BigSeller - สแกนและตรวจสอบ** (Scan to Inspection)

---

## 🛠️ รายละเอียด Tech Stack & Architecture

- **Extension Framework**: Chrome Extension Manifest V3 (Background Service Worker + Content Script Injection)
- **DOM Engine & Scraping**: Native JavaScript ES6+ (DOM Scraping via Direct Class Selectors `<span class="shipMethod">` & `<span class="tackingNo">`)
- **Video Capture & Burn-in Engine**: HTML5 `canvas.captureStream(15)` + HTML5 2D Canvas Context API (Real-time Metadata Watermark Overlay)
- **Video Encoding**: Browser Native `MediaRecorder API` (`video/mp4; codecs=avc1` / `video/webm`) @ 15 FPS / 2.5 Mbps
- **Performance & Stability Engine**: 
  - **Dual-Ticker System**: 15 FPS `setInterval` Fallback Ticker working alongside `requestAnimationFrame` to overcome Chrome Energy Saver tab throttling
  - **Flexible Camera Fallback**: Dynamic `getUserMedia` constraints fallback (exact device ID ➡️ ideal device ID ➡️ default camera) to prevent `OverconstrainedError`
- **Security & OAuth 2.0 Auth**: Google Identity API (`chrome.identity.launchWebAuthFlow`) + Auto-Validation via Google OAuth 2.0 UserInfo API
- **Cloud Storage Integration**: Google Drive REST API v3 (Multipart File Upload with Shared Drive support (`supportsAllDrives=true`, `includeItemsFromAllDrives=true`))
- **Data Integrity & Storage**: `chrome.storage.local` with automatic 3-day history cleanup & auto-local download backup on failed uploads

---

## ✨ ฟีเจอร์หลัก (Key Features v2.1.0)

1. **Logistics-Based Auto-Record Trigger**:
   - ตรวจจับข้อมูลบริษัทขนส่งจาก `<span class="ml_5 shipMethod">` เมื่อมีการสแกนพัสดุ
   - เริ่มบันทึกวิดีโออัตโนมัติทันที แม้เป็นออเดอร์ที่ไม่มี Tracking Number (`<span class="tackingNo">` เป็น `--`)
2. **Live Camera Standby Preview**:
   - แสดงภาพพรีวิวกล้องสดตลอดเวลาแม้อยู่ในโหมดสแตนด์บาย พร้อมป้าย "🟢 กล้องพร้อมใช้งาน"
3. **Scan Lock & Focus Intercept**:
   - เมื่อสแกนสินค้าครบทุกชิ้นและ Pop-up สแกนครบแล้วเด้งขึ้นมา ระบบจะบล็อกช่องป้อนข้อมูลและถอด Focus ออกจากช่องสแกนอัตโนมัติ เพื่อป้องกันเครื่องสแกนเนอร์ยิงบาร์โค้ดเข้ามาแทรกหรือเริ่มอัดวิดีโอซ้ำ
4. **Auto-Login Validation on Boot & One-Click Sign In**:
   - ตรวจสอบสิทธิ์ Google OAuth Token อัตโนมัติทุกครั้งที่เข้าหน้าเว็บ BigSeller
   - หากเซสชันหมดอายุ จะแสดง Overlay แจ้งเตือนฉุกเฉิน พร้อมปุ่ม **"🔑 คลิกที่นี่เพื่อลงชื่อเข้าใช้ Google Drive"** บนหน้าจอ ให้กดลงชื่อเข้าใช้ผ่าน Google OAuth ได้ทันที
5. **Crisp View & Seamless Packing Flow**:
   - ภาพหน้าจอกล้องคมชัดใสปิ๊ง ไม่มัวเบลอมุมมองกล้องขณะ Pop-up แสดงผล
   - ปุ่ม **"รับทราบ"** ทำหน้าที่ปิด Pop-up และปลดล็อค Scan Lock เท่านั้น (วิดีโอยังคงอัดภาพขั้นตอนการใส่ของและปิดกล่องพัสดุอย่างต่อเนื่อง)
   - วิดีโอจะสั่งหยุดอัดและอัปโหลดขึ้น Google Shared Drive เมื่อกดปุ่ม **"ล้างข้อมูล & สแกนถัดไป"** บน BigSeller

---

## 🚀 วิธีติดตั้งส่วนเสริมบน Google Chrome

1. เปิดเบราว์เซอร์ **Google Chrome** ไปที่: `chrome://extensions/`
2. เปิดใช้งาน **"โหมดนักพัฒนาซอฟต์แวร์" (Developer mode)** ที่มุมบนขวา
3. คลิกปุ่ม **"โหลดแอปที่คลายซิปแล้ว" (Load unpacked)** ที่มุมซ้ายบน
4. เลือกโฟลเดอร์ `extension` ที่อยู่ในโปรเจกต์นี้ (หรือแตกไฟล์จาก `packing_recorder_extension.zip`)
5. ปักหมุดไอคอนส่วนเสริม **Packing Recorder** บนแถบเครื่องมือ Chrome

---

## 📁 ไฟล์แพ็กเกจหลัก

- **ไฟล์ ZIP สำหรับติดตั้ง**: [packing_recorder_extension.zip](file:///Users/nuttun.k/Desktop/buildApps/personal_business/recording_pack/packing_recorder_extension.zip)
- **โฟลเดอร์ซอร์สโค้ด**: [extension/](file:///Users/nuttun.k/Desktop/buildApps/personal_business/recording_pack/extension)
- **ประวัติการปรับปรุงทั้งหมด**: [CHANGELOG.md](file:///Users/nuttun.k/Desktop/buildApps/personal_business/recording_pack/CHANGELOG.md)
