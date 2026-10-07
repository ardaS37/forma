/* Accessible matrix notation shared by questions, worked solutions and the tool. */
(() => {
function node(rows,{determinant=false,label=''}={}){
 const outer=document.createElement('span');outer.className='matrix-notation'+(determinant?' determinant-notation':'');outer.setAttribute('role','math');outer.setAttribute('aria-label',label||rows.map(r=>r.join(', ')).join('; '));
 const grid=document.createElement('span');grid.className='matrix-notation-grid';grid.style.gridTemplateColumns=`repeat(${rows[0].length}, minmax(2ch,auto))`;
 for(const row of rows)for(const value of row){const cell=document.createElement('span');cell.className='matrix-notation-cell';QuestionMath.render(cell,String(value),true);grid.append(cell);}outer.append(grid);return outer;
}
function append(target,source,render){
 const re=/(det\s*\(\s*)?(\[\s*\[[^\[\]]+\](?:\s*,\s*\[[^\[\]]+\])*\s*\])(\s*\))?/g;let match,last=0,found=false;
 while((match=re.exec(source))){const rows=match[2].slice(1,-1).match(/\[([^\[\]]+)\]/g).map(row=>row.slice(1,-1).split(',').map(x=>x.trim()));if(rows.some(r=>r.length!==rows[0].length)||rows.flat().some(x=>!x||!/^[\p{L}\p{N}\s+−\-*/^√().]+$/u.test(x)))continue;
  const determinant=!!match[1]&&!!match[3],end=match.index+match[0].length-(match[3]&&!determinant?match[3].length:0);const fragment=document.createElement('span');render(fragment,source.slice(last,match.index),true);target.append(...fragment.childNodes,node(rows,{determinant,label:source.slice(match.index,end)}));last=end;found=true;
 }if(found){const tail=document.createElement('span');render(tail,source.slice(last),true);target.append(...tail.childNodes);}return found;
}
globalThis.MatrixVisual={node,append};
})();
