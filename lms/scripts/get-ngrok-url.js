/**
 * NGROK PUBLIC URL FETCHER (ES Module)
 * Queries local Ngrok API (http://localhost:4040/api/tunnels)
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import http from 'http';

function getNgrokUrl() {
  const options = {
    hostname: '127.0.0.1',
    port: 4040,
    path: '/api/tunnels',
    method: 'GET',
    timeout: 3000
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const tunnels = json.tunnels || [];

        if (tunnels.length === 0) {
          console.log('\n[SALAM Ngrok] Belum ada tunnel aktif. Pastikan container salam-ngrok sedang berjalan.');
          return;
        }

        console.log('\n======================================================');
        console.log('   SALAM LMS — STAI AL-ITTIHAD CIANJUR');
        console.log('   STATUS NGROK PUBLIC HTTPS TUNNEL (ONLINE)');
        console.log('======================================================');
        tunnels.forEach((t) => {
          console.log(`- Nama Tunnel : ${t.name}`);
          console.log(`- Protokol    : ${t.proto.toUpperCase()}`);
          console.log(`- Public URL  : \x1b[32m\x1b[1m${t.public_url}\x1b[0m`);
          console.log(`- Meneruskan  : ${t.config.addr}`);
          console.log('------------------------------------------------------');
        });
        console.log(`- Dashboard Web Inspector: http://localhost:4040`);
        console.log('======================================================\n');
      } catch (err) {
        console.error('[SALAM Ngrok] Gagal mem-parsing data tunnel:', err.message);
      }
    });
  });

  req.on('error', () => {
    console.log('\n[SALAM Ngrok] Tidak dapat terhubung ke Ngrok API (http://localhost:4040).');
    console.log('Pastikan service ngrok sudah dijalankan via Docker:');
    console.log('  > docker compose up -d salam-ngrok\n');
  });

  req.end();
}

getNgrokUrl();
