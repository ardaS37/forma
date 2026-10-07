/* Shared graph question format. Only serializable data is saved with a question. */
(() => {
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>Number(value.toPrecision(5)).toString();
function render(graph,language='tr',identity='graph'){
 if(!graph||graph.version!==1||!Array.isArray(graph.bounds)||graph.bounds.length!==4)throw Error('Invalid question graph');
 let [xmin,xmax,ymin,ymax]=graph.bounds;
 if(!graph.bounds.every(Number.isFinite)||xmin>=xmax||ymin>=ymax)throw Error('Invalid graph bounds');
 const width=380,height=300,left=40,right=20,top=30,bottom=42,w=width-left-right,h=height-top-bottom;
 if(graph.equalScale!==false){const scale=Math.max((xmax-xmin)/w,(ymax-ymin)/h),cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;xmin=cx-w*scale/2;xmax=cx+w*scale/2;ymin=cy-h*scale/2;ymax=cy+h*scale/2;}
 const X=x=>left+w*(x-xmin)/(xmax-xmin),Y=y=>top+h*(ymax-y)/(ymax-ymin);
 const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
 const path=points=>{if(!Array.isArray(points)||points.length>4096||!points.every(point))throw Error('Invalid graph points');return points.map(([x,y],i)=>`${i?'L':'M'}${number(X(x))},${number(Y(y))}`).join(' ');};
 const hash=[...String(identity+language)].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261),clip='qg-'+hash;
 const title=graph.title?.[language]||graph.title?.tr||'Graph',description=graph.description?.[language]||graph.description?.tr||'';
 let svg=`<svg class="question-graph" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${clip}-title ${clip}-desc" data-x-scale="${number(w/(xmax-xmin))}" data-y-scale="${number(h/(ymax-ymin))}"><title id="${clip}-title">${escape(title)}</title><desc id="${clip}-desc">${escape(description)}</desc><defs><clipPath id="${clip}"><rect x="${left}" y="${top}" width="${w}" height="${h}"/></clipPath></defs>`;
 const step=(span,requested)=>{if(Number.isFinite(requested)&&requested>0)return requested;const base=10**Math.floor(Math.log10(span/7)),ratio=span/7/base;return(ratio<=1?1:ratio<=2?2:ratio<=5?5:10)*base;};
 const sx=step(xmax-xmin,graph.xStep),sy=step(ymax-ymin,graph.yStep),axisY=Y(Math.max(ymin,Math.min(ymax,0))),axisX=X(Math.max(xmin,Math.min(xmax,0)));
 if((xmax-xmin)/sx>100||(ymax-ymin)/sy>100)throw Error('Too many graph ticks');
 svg+='<g class="graph-grid" fill="none" stroke="var(--line)" stroke-width="0.7">';
 if(graph.grid!==false&&!graph.numberLine)for(let i=Math.ceil(xmin/sx);i<=Math.floor(xmax/sx);i++)svg+=`<path d="M${number(X(i*sx))} ${top}V${top+h}"/>`;
 if(graph.grid!==false&&!graph.numberLine)for(let i=Math.ceil(ymin/sy);i<=Math.floor(ymax/sy);i++)svg+=`<path d="M${left} ${number(Y(i*sy))}H${left+w}"/>`;
 svg+='</g><g class="graph-axes" fill="none" stroke="var(--ink)" stroke-width="1.2">';
 if(graph.axes!==false)svg+=`<path d="M${left} ${number(axisY)}H${left+w}"/>`;
 if(graph.axes!==false&&!graph.numberLine)svg+=`<path d="M${number(axisX)} ${top}V${top+h}"/>`;
 svg+='</g><g class="graph-ticks" fill="var(--ink)" stroke="none" font-size="11" font-family="sans-serif">';
 if(graph.ticks!==false)for(let i=Math.ceil(xmin/sx);i<=Math.floor(xmax/sx);i++)svg+=`<text x="${number(X(i*sx))}" y="${top+h+17}" text-anchor="middle">${number(i*sx)}</text>`;
 if(graph.ticks!==false&&!graph.numberLine)for(let i=Math.ceil(ymin/sy);i<=Math.floor(ymax/sy);i++)svg+=`<text x="${left-7}" y="${number(Y(i*sy)+4)}" text-anchor="end">${number(i*sy)}</text>`;
 if(graph.axes!==false)svg+=`<text x="${left+w}" y="${top+h+33}" text-anchor="end">${escape(graph.xLabel||'x')}</text>`;
 if(graph.axes!==false&&!graph.numberLine)svg+=`<text x="${left}" y="16">${escape(graph.yLabel||'y')}</text>`;
 svg+=`</g><g clip-path="url(#${clip})">`;
 for(const region of graph.regions||[])svg+=`<path class="graph-region" d="${path(region.points)} Z" fill="var(--accent)" fill-opacity="0.13" stroke="none"/>`;
 for(const curve of graph.curves||[]){const d=path(curve.points);svg+=`<path class="graph-curve${curve.dashed?' graph-dashed':''}${curve.secondary?' graph-secondary':''}" d="${d}" fill="none" stroke="${curve.secondary?'var(--ink)':'var(--accent)'}" stroke-width="${graph.numberLine?5:2}"${curve.dashed?' stroke-dasharray="6 4"':''}/>`;}
 for(const arrow of graph.arrows||[]){if(!point(arrow.from)||!point(arrow.to))throw Error('Invalid graph arrow');const x=X(arrow.to[0]),y=Y(arrow.to[1]),a=Math.atan2(y-Y(arrow.from[1]),x-X(arrow.from[0]));svg+=`<path class="graph-arrow" d="${path([arrow.from,arrow.to])} M${number(x-7*Math.cos(a-.5))},${number(y-7*Math.sin(a-.5))} L${number(x)},${number(y)} L${number(x-7*Math.cos(a+.5))},${number(y-7*Math.sin(a+.5))}" fill="none" stroke="var(--ink)" stroke-width="1.7"/>`;}
 for(const marker of graph.points||[]){if(!Number.isFinite(marker.x)||!Number.isFinite(marker.y))throw Error('Invalid graph marker');svg+=`<circle class="graph-point${marker.open?' graph-open':''}" cx="${number(X(marker.x))}" cy="${number(Y(marker.y))}" r="4" fill="${marker.open?'var(--paper)':'var(--accent)'}" stroke="var(--accent)" stroke-width="1.8"/>`;}
 svg+='</g><g class="graph-annotations" fill="var(--ink)" stroke="none" font-size="11" font-family="sans-serif">';
 for(const label of graph.labels||[]){if(!Number.isFinite(label.x)||!Number.isFinite(label.y))throw Error('Invalid graph label');const text=typeof label.text==='object'?(label.text[language]||label.text.tr):label.text;svg+=`<text x="${number(X(label.x)+(label.dx||0))}" y="${number(Y(label.y)+(label.dy||-9))}" text-anchor="${label.anchor==='end'?'end':label.anchor==='middle'?'middle':'start'}">${escape(text)}</text>`;}
 svg+='</g></svg>';
 const curves=(graph.curves||[]).filter(c=>c.label),legend=curves.length?`<div class="question-graph-legend">${curves.map(c=>`<span class="${c.dashed?'legend-dashed':''} ${c.secondary?'legend-secondary':''}">${escape(typeof c.label==='object'?(c.label[language]||c.label.tr):c.label)}</span>`).join('')}</div>`:'';
 return `<figure class="question-graph-figure">${svg}${legend}<figcaption>${escape(title)}</figcaption></figure>`;
}
function sample(fn,from,to,count=160){return Array.from({length:count+1},(_,i)=>{const x=from+(to-from)*i/count;return[x,fn(x)];});}
function parametric(fn,from,to,count=200){return Array.from({length:count+1},(_,i)=>fn(from+(to-from)*i/count));}
globalThis.QuestionGraphs={render,sample,parametric,number,escape};
})();
