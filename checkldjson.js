const fs = require('fs');
const files = ['blog-kuwait.html','blog-malaysia.html','blog-netherlands.html','blog-qatar.html','blog-usa.html'];
let ok = true;
files.forEach(f => {
  const txt = fs.readFileSync(f, 'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    const s = m[1];
    try {
      JSON.parse(s);
    } catch (e) {
      console.error('FAIL', f, e.message);
      ok = false;
    }
  }
});
if (ok) console.log('ok'); else process.exit(1);
