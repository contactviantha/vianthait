const fs=require('fs');
const p=process.argv[2];
let s=fs.readFileSync(p,'utf8');
s=s.replace(/\$65\/hr/gi,'').replace(/\$65/g,'').replace(/65 USD/gi,'');
s=s.replace(/\bper hour\b/gi,'').replace(/\bhourly rate\b/gi,'').replace(/\bpublished rate\b/gi,'');
s=s.replace(/  +/g,' ').replace(/\.\s+\./g,'.').replace(/,\s+,/g,',');
fs.writeFileSync(p,s);
console.log('done',p);
