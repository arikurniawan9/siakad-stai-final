/**
 * Captcha Service untuk SALAM LMS STAI Al-Ittihad
 * Menghasilkan 4-digit captcha alfanumerik anti-bot bebas karakter ambigu
 * Selaras dengan sistem Captcha SIAKAD STAI Al-Ittihad
 */

export interface CaptchaData {
  code: string;
  image: string;
  expiresAt: number;
}

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CAPTCHA_STORAGE_KEY = 'salam_lms_captcha_active';

export const captchaService = {
  /**
   * Pembangkitan Captcha 4 Digit Alfanumerik dengan Garis Noise & Rotasi Karakter
   */
  generate(): CaptchaData {
    let code = '';
    const length = 4;
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * CHARSET.length);
      code += CHARSET[idx];
    }

    const width = 160;
    const height = 50;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="100%" height="100%" fill="#F1F5F9" rx="8" />`;

    // Garis-garis noise
    for (let i = 0; i < 4; i++) {
      const x1 = Math.floor(Math.random() * width);
      const y1 = Math.floor(Math.random() * height);
      const x2 = Math.floor(Math.random() * width);
      const y2 = Math.floor(Math.random() * height);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#CBD5E1" stroke-width="1.5" />`;
    }

    // Titik-titik dot matrix noise
    for (let i = 0; i < 25; i++) {
      const cx = Math.floor(Math.random() * width);
      const cy = Math.floor(Math.random() * height);
      const r = Math.floor(Math.random() * 2) + 1;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#94A3B8" opacity="0.4" />`;
    }

    // Render karakter dengan sudut rotasi acak
    const colors = ['#1B365D', '#107C41', '#0F766E', '#1E293B'];
    let charX = 22;

    for (let i = 0; i < length; i++) {
      const char = code[i];
      const color = colors[i % colors.length];
      const rotate = Math.floor(Math.random() * 30) - 15;
      const charY = Math.floor(Math.random() * 5) + 33;

      svg += `<text x="${charX}" y="${charY}" fill="${color}" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="25" transform="rotate(${rotate}, ${charX}, ${charY})">${char}</text>`;
      charX += 32;
    }

    svg += `</svg>`;

    // Base64 encode
    let base64 = '';
    if (typeof window !== 'undefined' && window.btoa) {
      base64 = `data:image/svg+xml;base64,${window.btoa(svg)}`;
    } else {
      base64 = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    const captchaData: CaptchaData = {
      code,
      image: base64,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CAPTCHA_STORAGE_KEY, JSON.stringify(captchaData));
    }

    return captchaData;
  },

  /**
   * Verifikasi Captcha (Case-Insensitive)
   */
  verify(inputCode: string): boolean {
    if (typeof window === 'undefined') return true;

    const storedStr = sessionStorage.getItem(CAPTCHA_STORAGE_KEY);
    if (!storedStr) return false;

    try {
      const stored: CaptchaData = JSON.parse(storedStr);
      if (Date.now() > stored.expiresAt) {
        sessionStorage.removeItem(CAPTCHA_STORAGE_KEY);
        return false;
      }

      const isValid = stored.code.toUpperCase() === inputCode.trim().toUpperCase();
      sessionStorage.removeItem(CAPTCHA_STORAGE_KEY);
      return isValid;
    } catch {
      return false;
    }
  }
};
