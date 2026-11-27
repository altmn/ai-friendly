/* Evaluator only: caller supplies an integrity-verified Readability 0.6.0 package. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [folder,input,output]=process.argv.slice(2);
const Readability=require(path.resolve(folder,'Readability.js'));
const Parser=require(path.resolve(folder,'JSDOMParser.js'));
const raw=fs.readFileSync(input,'utf8'),doc=new Parser().parse(raw);
doc.documentURI='https://example.test/extractor.html';doc.baseURI=doc.documentURI;
const result=new Readability(doc).parse();
fs.writeFileSync(output,JSON.stringify({extractor:'Mozilla Readability',version:JSON.parse(fs.readFileSync(path.join(folder,'package.json'))).version,parser:'Bundled JSDOMParser; no script execution or network',options:'Readability defaults; charThreshold 500',input_sha256:crypto.createHash('sha256').update(raw).digest('hex'),result},null,2)+'\n');
console.log(JSON.stringify({version:'0.6.0',result_present:!!result,price31:result?.textContent.includes('31 USD'),eligibility:result?.textContent.includes('Canadian'),link:result?.content.includes('https://example.test/terms')}));
