const fs=require('fs');
const files=['blog-kuwait.html','blog-malaysia.html','blog-netherlands.html','blog-qatar.html'];
files.forEach(f=>{
  const t=fs.readFileSync(f,'utf8');
  const m=t.match(/\$65|65 USD|\$65\/hr|\bper hour\b|\bhourly rate\b|\bpublished rate\b/gi);
  console.log(f+':'+(m?m.length:0));
});
