(function(){
const supers={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-'},sub={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
function normalize(s){let depths=[],out='';for(let i=0;i<s.length;i++){const c=s[i];if(c==='(')depths.push(/(?:sin|cos|tan|ln|log|exp)\s*$/.test(s.slice(0,i)));if(c===')')depths.pop();out+=c===','&&/\d/.test(s[i-1]||'')&&/\d/.test(s[i+1]||'')&&(!depths.length||depths.at(-1))?'.':c;}s=out;return s.replace(/½/g,'(1/2)').replace(/⅓/g,'(1/3)').replace(/⅔/g,'(2/3)').replace(/¼/g,'(1/4)').replace(/¾/g,'(3/4)').replace(/[−–]/g,'-').replace(/×|·/g,'*').replace(/÷/g,'/').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g,x=>'^('+[...x].map(c=>supers[c]).join('')+')').replace(/[₀₁₂₃₄₅₆₇₈₉]+/g,x=>'_'+[...x].map(c=>sub[c]).join(''));}
const names=new Set(['sin','cos','tan','cot','sec','csc','asin','acos','atan','acot','sinh','cosh','tanh','coth','sech','csch','asinh','acosh','atanh','acoth','asech','acsch','factorial','ln','log','exp','sqrt','lim','det','abs','pi']);
function expressionLatex(core){
 const normalized=ExactMath.rewrite(normalize(core)).replace(/\b(sin|cos|tan|cot|sec|csc|sinh|cosh|tanh)\^\((\d+)\)([xyαβθ])/g,'$1($3)^$2');
 if(globalThis.math&&!/[∫∑∏∂°]/.test(normalized)){
  try{const pieces=normalized.split(/([=<>≤≥≠≈])/),relations={'=':'=','<':'<','>':'>','≤':'\\le ','≥':'\\ge ','≠':'\\ne ','≈':'\\approx '};
   return pieces.map((piece,i)=>i%2?relations[piece]:!piece.trim()?'':math.parse(piece.trim()).toTex({parenthesis:'auto',implicit:'hide'})).join('');
  }catch{}
 }
 // The ASCII converter reads bare function calls next to '/' as individual
 // letters. Group each function atom before it processes a fraction.
 let grouped=normalized;
 const call=/\b(?:sin|cos|tan|cot|sec|csc|sinh|cosh|tanh|ln|log|exp|sqrt)\(/g;
 const atoms=[];let match;
 while((match=call.exec(normalized))){let depth=1,end=call.lastIndex;while(end<normalized.length&&depth){if(normalized[end]==='(')depth++;else if(normalized[end]===')')depth--;end++;}if(!depth&&(normalized.slice(end).trimStart().startsWith('/')||normalized.slice(0,match.index).trimEnd().endsWith('/')))atoms.push([match.index,end]);}
 for(const[start,end]of atoms.reverse())grouped=grouped.slice(0,start)+'('+grouped.slice(start,end)+')'+grouped.slice(end);
 return MathLive.convertAsciiMathToLatex(grouped).replace(/′/g,'^{\\prime}').replace(/″/g,'^{\\prime\\prime}').replace(/±/g,'\\pm ').replace(/∓/g,'\\mp ');
}
function render(node,source,enabled,latex){source=globalThis.ExactMath?ExactMath.rewrite(String(source||'')):String(source||'');if(latex&&globalThis.ExactMath)latex=ExactMath.rewrite(latex,true);node.replaceChildren();node.dataset.mathSource=source;if(!enabled){node.textContent=source;return;}
if(!latex&&globalThis.MatrixVisual&&MatrixVisual.append(node,source,render))return;
if(latex){try{const span=document.createElement('span');span.className='question-math-expression';span.setAttribute('role','math');span.setAttribute('aria-label',source);span.innerHTML=MathLive.convertLatexToMarkup(latex,{displayMode:false});node.append(span);return;}catch{}}
const tokens=source.match(/\d+(?:[.,]\d+)?|[\p{L}]+|[\s]+|[^\p{L}\d\s]/gu)||[];let buffer='';function flush(){if(!buffer)return;const text=buffer;buffer='';if(!/[\/√^²³⁴¹⁰₀-₉=<>≤≥∫∑ΣΠπ½⅓⅔¼¾]/.test(text)&&!/(?:sin|cos|tan|ln|log)/.test(text)){node.append(document.createTextNode(text));return;}const leading=text.match(/^\s*/)[0],trailing=text.match(/\s*$/)[0],core=text.trim();if(leading)node.append(document.createTextNode(leading));try{const span=document.createElement('span');span.className='question-math-expression';span.setAttribute('role','math');span.setAttribute('aria-label',core);span.innerHTML=MathLive.convertLatexToMarkup(expressionLatex(core),{displayMode:false});node.append(span);}catch{node.append(document.createTextNode(core));}if(trailing)node.append(document.createTextNode(trailing));}
for(const token of tokens){if(token===';'){flush();node.append(document.createTextNode(token));continue;}const allowed=/^\s+$/.test(token)||/^\d/.test(token)||names.has(token)||/^[a-zA-Zα-ωΑ-Ωπ]$/.test(token)||/^[+\-−–*/÷×·^_=<>≤≥≠≈()[\]{}|%!,;:√∞∫∑∏∂ΣΠ∈ℝ→⁰¹²³⁴⁵⁶⁷⁸⁹⁻₀₁₂₃₄₅₆₇₈₉½⅓⅔¼¾′″±∓]$/.test(token);if(allowed)buffer+=token;else{flush();node.append(document.createTextNode(token));}}flush();}
globalThis.QuestionMath={render};
})();
