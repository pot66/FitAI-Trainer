// =====================================================================
// FitAI Trainer - Production Client Security & Anti-Inspection Guard
// ป้องกันการกด F12, Inspect Element, ดู Source Code, และการเปิด DevTools
// =====================================================================

/**
 * ตรวจสอบว่ากำลังทำงานใน Production หรือไม่
 */
export const isProductionEnvironment = () => {
  if (typeof window === "undefined") return false;
  // ทำงานใน Production build หรือเมื่อไม่ได้รันอยู่บน localhost/127.0.0.1
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.");
  
  return import.meta.env.PROD || !isLocal;
};

let isGuardActive = false;
let devToolsOpen = false;
let overlayElement = null;

/**
 * สร้างและแสดงหน้าจอแจ้งเตือนความปลอดภัยเมื่อตรวจพบการเปิด DevTools
 */
const showSecurityOverlay = () => {
  if (overlayElement) return;

  overlayElement = document.createElement("div");
  overlayElement.id = "fitai-security-shield-overlay";
  overlayElement.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(8, 12, 20, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #ffffff;
    padding: 24px;
    user-select: none;
    -webkit-user-select: none;
  `;

  overlayElement.innerHTML = `
    <div style="
      max-width: 460px;
      width: 100%;
      background: rgba(18, 24, 38, 0.95);
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 28px;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 25px 60px -15px rgba(239, 68, 68, 0.25), 0 0 40px rgba(0,0,0,0.8);
      position: relative;
    ">
      <div style="
        width: 72px;
        height: 72px;
        border-radius: 22px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.05));
        border: 1px solid rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        color: #ef4444;
      ">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m14.5 9-5 5"/>
          <path d="m9.5 9 5 5"/>
        </svg>
      </div>

      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 10px; color: #ffffff; letter-spacing: -0.02em;">
        ตรวจพบเครื่องมือนักพัฒนา (Developer Tools)
      </h2>

      <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px;">
        เพื่อความปลอดภัยของข้อมูลและป้องกันการเข้าถึง Source Code บนระบบ Production กรุณาปิด Developer Tools (F12) เพื่อใช้งานต่อตามปกติ
      </p>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button id="fitai-security-reload-btn" style="
          width: 100%;
          padding: 13px 20px;
          background: linear-gradient(135deg, #0284c7, #2563eb);
          color: #ffffff;
          border: none;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
        ">
          รีเฟรชหน้าเว็บ
        </button>
      </div>

      <div style="margin-top: 20px; font-size: 11px; color: #64748b; font-weight: 500;">
        FitAI Trainer Security Guard System
      </div>
    </div>
  `;

  document.body.appendChild(overlayElement);

  const reloadBtn = document.getElementById("fitai-security-reload-btn");
  if (reloadBtn) {
    reloadBtn.onclick = () => window.location.reload();
  }
};

/**
 * ลบหน้าจอแจ้งเตือนความปลอดภัยเมื่อ DevTools ปิดลง
 */
const hideSecurityOverlay = () => {
  if (overlayElement && overlayElement.parentNode) {
    overlayElement.parentNode.removeChild(overlayElement);
    overlayElement = null;
  }
};

/**
 * 1. ป้องกันปุ่มคีย์ลัดสำหรับเปิด Developer Tools, Inspect Element และ View Source
 */
const setupKeyboardBlocker = () => {
  window.addEventListener(
    "keydown",
    (e) => {
      // 1.1 F12 Key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 1.2 Ctrl+Shift+I / Cmd+Option+I (Inspect)
      // 1.3 Ctrl+Shift+J / Cmd+Option+J (Console)
      // 1.4 Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
      // 1.5 Ctrl+Shift+K / Cmd+Option+K (Firefox Web Console)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ["I", "i", "J", "j", "C", "c", "K", "k"].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 1.6 Ctrl+U / Cmd+Option+U (View Page Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 1.7 Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true // Use capture phase so event is intercepted before any other handler
  );
};

/**
 * 2. ป้องกันการคลิกขวา (Context Menu) เพื่อไม่ให้เลือก Inspect / View Source
 */
const setupContextMenuBlocker = () => {
  window.addEventListener(
    "contextmenu",
    (e) => {
      // อนุญาตคลิกขวาในช่องพิมพ์ข้อความ (input, textarea) เพื่อความสะดวกในการ copy/paste
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    true
  );
};

/**
 * 3. ป้องกันและล้าง Console เพื่อไม่ให้ดูข้อมูลหรือตัวแปรภายในระบบ
 */
const setupConsoleProtection = () => {
  try {
    // ปิดการพิมพ์ console logs ทั่วไปใน Production
    const noop = () => {};
    window.console.log = noop;
    window.console.info = noop;
    window.console.debug = noop;
    window.console.trace = noop;
    window.console.dir = noop;
    window.console.table = noop;

    // แสดงคำเตือนด้านความปลอดภัยแทน
    setTimeout(() => {
      try {
        window.console.clear();
      } catch (err) {}
    }, 500);
  } catch (err) {}
};

/**
 * 4. ตรวจจับการเปิด Developer Tools ผ่านขนาดหน้าต่าง (Window Dimension Delta)
 * เมื่อเปิด DevTools ไม่ว่าจะด้านข้างหรือด้านล่าง Window ขนาด outer กับ inner จะต่างกันอย่างมีนัยสำคัญ
 */
const setupDevToolsDetector = () => {
  const threshold = 160;

  const checkDevToolsByDimension = () => {
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if (widthDiff || heightDiff) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        showSecurityOverlay();
      }
    } else {
      if (devToolsOpen) {
        devToolsOpen = false;
        hideSecurityOverlay();
      }
    }
  };

  window.addEventListener("resize", checkDevToolsByDimension);
  setInterval(checkDevToolsByDimension, 1500);

  // 4.2 ตรวจสอบผ่าน Debugger Timing Trap (เปิด DevTools แล้วค้าง debugger)
  setInterval(() => {
    const startTime = performance.now();
    try {
      const debugFn = new Function("debugger");
      debugFn();
    } catch (e) {}
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        showSecurityOverlay();
      }
    }
  }, 3000);
};

/**
 * เริ่มต้นระบบป้องกันความปลอดภัยทั้งหมด
 */
export const initSecurityGuard = (forceEnable = false) => {
  if (isGuardActive) return;

  // ตรวจสอบเงื่อนไขการทำงาน: เฉพาะใน Production (หรือเมื่อ forceEnable = true)
  if (!forceEnable && !isProductionEnvironment()) {
    return;
  }

  isGuardActive = true;

  // 1. บล็อกปุ่ม F12, Inspect, View Source
  setupKeyboardBlocker();

  // 2. บล็อกคลิกขวา
  setupContextMenuBlocker();

  // 3. ควบคุมและปิด Console Logs
  setupConsoleProtection();

  // 4. ตรวจจับและขึ้นแจ้งเตือนเมื่อเปิด DevTools
  setupDevToolsDetector();
};

export default initSecurityGuard;
