/* ══════════════════════════════════════════════════════════════
   TABLEAU REPLICA — Airbnb Seattle 2016
   Desktop: 2-column grid with cross-filtering
   Mobile: fully interactive stacked layout with touch-optimized
           zip tap-to-filter + bedroom chips + filter banner
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Data ──────────────────────────────────────────────────── */
  const ZIP_DATA = [
    {zip:'98134',price:206.6,col:'#e15759'},{zip:'98119',price:169.2,col:'#f28e2b'},
    {zip:'98101',price:165.9,col:'#4e79a7'},{zip:'98109',price:156.8,col:'#76b7b2'},
    {zip:'98121',price:155.4,col:'#59a14f'},{zip:'98199',price:152.3,col:'#edc948'},
    {zip:'98116',price:148.1,col:'#b07aa1'},{zip:'98136',price:145.2,col:'#ff9da7'},
    {zip:'98112',price:143.8,col:'#9c755f'},{zip:'98104',price:132.9,col:'#bab0ac'},
    {zip:'98122',price:130.1,col:'#e15759'},{zip:'98102',price:128.6,col:'#f28e2b'},
    {zip:'98126',price:127.3,col:'#4e79a7'},{zip:'98107',price:125.4,col:'#76b7b2'},
    {zip:'98103',price:122.9,col:'#59a14f'},{zip:'98115',price:120.1,col:'#edc948'},
    {zip:'98144',price:110.2,col:'#b07aa1'},{zip:'98105',price:104.1,col:'#ff9da7'},
    {zip:'98146',price: 98.3,col:'#9c755f'},{zip:'98117',price: 95.4,col:'#bab0ac'},
    {zip:'98178',price: 94.9,col:'#e15759'},{zip:'98118',price: 93.1,col:'#f28e2b'},
    {zip:'98108',price: 84.8,col:'#4e79a7'},{zip:'98077',price: 82.7,col:'#76b7b2'},
    {zip:'98106',price: 76.9,col:'#59a14f'},{zip:'98133',price: 74.3,col:'#edc948'},
    {zip:'98125',price: 64.7,col:'#b07aa1'},
  ];

  const BED_PRICE = [
    {beds:1,price:96.2},{beds:2,price:175.4},{beds:3,price:249.7},
    {beds:4,price:315.4},{beds:5,price:450.0},{beds:6,price:584.8},
  ];
  const BED_COUNT = [
    {beds:1,count:1811},{beds:2,count:483},{beds:3,count:206},
    {beds:4,count:55},{beds:5,count:20},{beds:6,count:5},
  ];

  /* Weekly revenue 2016 — 52 weeks */
  const REV = (function(){
    const v=[1323,1380,1440,1510,1580,1640,1700,1750,1800,1840,
      1870,1890,1910,1920,1930,1915,1900,1920,1930,1940,
      1950,1960,1975,1985,1990,2010,2030,2030,2020,2010,
      2000,1990,1990,2000,2010,2020,2020,2010,2000,1990,
      1980,1960,1950,1970,1990,2010,2030,2050,2060,2080,2095,2110];
    const lbl=[];
    const s=new Date('2016-01-31');
    for(let i=0;i<52;i++){const d=new Date(s);d.setDate(d.getDate()+i*7);lbl.push(d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+", '16");}
    return {labels:lbl,values:v.map(x=>x*1000)};
  })();

  const T={bg:'#fff',border:'#d0d0d0',text:'#333',muted:'#666',blue:'#1f4e79',revLine:'#5b9bd5',navy:'#1f3864',highlight:'#ff6b35'};

  let charts={};
  let selZip=null;
  let selBed=null;

  function destroyAll(){Object.values(charts).forEach(c=>{try{c.destroy();}catch(e){}});charts={};}

  function mkCanvas(id,h){
    const c=document.createElement('canvas');
    c.id=id; c.setAttribute('height',h);
    c.style.cssText='width:100%;display:block;max-height:'+h+'px;';
    return c;
  }
  function mkCard(h,extra){
    const d=document.createElement('div');
    Object.assign(d.style,{background:T.bg,border:'1px solid '+T.border,borderRadius:'3px',
      padding:'8px 10px 6px',overflow:'hidden',height:h+'px',boxSizing:'border-box',
      display:'flex',flexDirection:'column',...(extra||{})});
    return d;
  }
  function mkCardAuto(extra){
    const d=document.createElement('div');
    Object.assign(d.style,{background:T.bg,border:'1px solid '+T.border,borderRadius:'3px',
      padding:'10px 12px 10px',boxSizing:'border-box',
      display:'flex',flexDirection:'column',...(extra||{})});
    return d;
  }
  function secTitle(text){
    const d=document.createElement('div');
    Object.assign(d.style,{fontSize:'0.7rem',fontWeight:'600',color:T.text,marginBottom:'4px',flexShrink:'0',lineHeight:'1.3'});
    d.textContent=text; return d;
  }
  function axisLbl(text,style){
    const d=document.createElement('div');
    Object.assign(d.style,{fontSize:'0.6rem',color:T.muted,textAlign:'center',flexShrink:'0',marginTop:'2px',...(style||{})});
    d.textContent=text; return d;
  }

  /* ── Filter banner (shared desktop + mobile) ───────────────── */
  function mkBanner(root,wrap){
    if(!selZip&&!selBed) return;
    const banner=document.createElement('div');
    Object.assign(banner.style,{background:'#e8f4fd',border:'1px solid #90caf9',borderRadius:'4px',
      padding:'6px 12px',fontSize:'0.7rem',color:'#1a4f8a',display:'flex',
      justifyContent:'space-between',alignItems:'center',gap:'8px'});
    const parts=[];
    if(selZip) parts.push('Zip: '+selZip);
    if(selBed) parts.push('Bedrooms: '+selBed);
    banner.innerHTML='<span>Filter: <strong>'+parts.join(' + ')+'</strong></span>';
    const clr=document.createElement('button');
    clr.textContent='Clear';
    Object.assign(clr.style,{cursor:'pointer',fontWeight:'700',color:'#d44',background:'none',
      border:'1px solid #d44',borderRadius:'4px',padding:'3px 10px',fontSize:'0.65rem',
      flexShrink:'0',touchAction:'manipulation'});
    clr.addEventListener('click',()=>{selZip=null;selBed=null;build(root);});
    banner.appendChild(clr);
    wrap.appendChild(banner);
  }

  /* ── Build dispatcher ──────────────────────────────────────── */
  function build(root){
    destroyAll();
    root.innerHTML='';
    const W=root.offsetWidth||800;
    const isMobile=W<520;

    const wrap=document.createElement('div');
    Object.assign(wrap.style,{fontFamily:'Arial,sans-serif',background:'#f8f8f8',
      width:'100%',boxSizing:'border-box',padding:'6px',display:'flex',flexDirection:'column',gap:'6px'});
    root.appendChild(wrap);

    mkBanner(root,wrap);

    if(isMobile){ buildMobile(wrap,root); return; }
    buildDesktop(wrap,root);
  }

  /* ── Desktop layout ────────────────────────────────────────── */
  function buildDesktop(wrap,root){
    const grid=document.createElement('div');
    Object.assign(grid.style,{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:'5px'});
    wrap.appendChild(grid);

    const leftCol=document.createElement('div');
    Object.assign(leftCol.style,{display:'flex',flexDirection:'column',gap:'5px'});
    grid.appendChild(leftCol);

    const rightCol=document.createElement('div');
    Object.assign(rightCol.style,{display:'flex',flexDirection:'column',gap:'5px'});
    grid.appendChild(rightCol);

    /* Revenue line */
    const REV_H=170;
    {
      const card=mkCard(REV_H);
      card.appendChild(secTitle('Yearly Airbnb Revenue in Seattle for 2016'));
      card.appendChild(axisLbl('price ($)',{textAlign:'left',marginBottom:'2px'}));
      const cv=mkCanvas('tb-rev',REV_H-46);
      card.appendChild(cv);
      card.appendChild(axisLbl('Revenue (per week)'));
      leftCol.appendChild(card);
      charts['rev']=new Chart(cv.getContext('2d'),{
        type:'line',
        data:{labels:REV.labels,datasets:[{data:REV.values,borderColor:T.revLine,backgroundColor:'rgba(91,155,213,0.12)',fill:true,tension:0.35,pointRadius:0,borderWidth:2}]},
        options:{responsive:false,animation:false,maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>'$'+(ctx.raw/1000).toFixed(0)+'K'}}},
          scales:{
            x:{grid:{display:false},ticks:{font:{size:7},color:T.muted,maxTicksLimit:7,maxRotation:0},border:{color:'rgba(0,0,0,0.15)'}},
            y:{ticks:{font:{size:9},color:T.muted,callback:v=>(v===0?'0K':(v/1000).toFixed(0)+'K'),maxTicksLimit:5},grid:{color:'rgba(0,0,0,0.06)'},border:{color:'rgba(0,0,0,0.15)'}},
          },
        },
      });
    }

    /* Zip bar chart */
    const ZIP_H=220;
    {
      const card=mkCard(ZIP_H);
      card.appendChild(secTitle('Avg Airbnb Price by Zipcode — click to filter'));
      card.appendChild(axisLbl('Avg. Price ($)',{textAlign:'left',marginBottom:'1px'}));
      const cv=mkCanvas('tb-zip',ZIP_H-44);
      card.appendChild(cv);
      card.appendChild(axisLbl('Zipcode'));
      leftCol.appendChild(card);
      charts['zip']=new Chart(cv.getContext('2d'),{
        type:'bar',
        data:{
          labels:ZIP_DATA.map(z=>z.zip),
          datasets:[{
            data:ZIP_DATA.map(z=>z.price),
            backgroundColor:ZIP_DATA.map(z=>selZip===z.zip?T.highlight:(selZip?'rgba(180,180,180,0.5)':z.col)),
            borderWidth:0,maxBarThickness:16,
          }],
        },
        options:{responsive:false,animation:{duration:200},maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>'$'+ctx.raw.toFixed(1)+'/night avg'}}},
          onClick:(evt,els)=>{
            if(els.length){const z=ZIP_DATA[els[0].index].zip;selZip=(selZip===z?null:z);build(root);}
          },
          scales:{
            x:{grid:{display:false},ticks:{font:{size:6.5},color:T.muted,maxRotation:90,minRotation:45},border:{color:'rgba(0,0,0,0.15)'}},
            y:{min:0,grid:{color:'rgba(0,0,0,0.06)'},ticks:{font:{size:9},color:T.muted,maxTicksLimit:5},border:{color:'rgba(0,0,0,0.15)'}},
          },
        },
      });
    }

    /* Right: Value range + Bedroom table */
    const TOP_R=180;
    {
      const card=mkCard(TOP_R,{padding:'8px 10px'});
      const vr=document.createElement('div');
      Object.assign(vr.style,{marginBottom:'8px',flexShrink:'0'});
      vr.innerHTML=
        '<div style="font-size:0.65rem;font-weight:600;color:'+T.text+';margin-bottom:3px;">Value Range for Revenue</div>'
        +'<div style="height:11px;background:linear-gradient(to right,#d6e8f5,'+T.navy+');border-radius:2px;"></div>'
        +'<div style="display:flex;justify-content:space-between;font-size:0.58rem;color:'+T.muted+';margin-top:1px;"><span>$1,322,849</span><span>$2,110,350</span></div>';
      card.appendChild(vr);

      const bedHdr=document.createElement('div');
      Object.assign(bedHdr.style,{fontSize:'0.68rem',fontWeight:'600',color:T.text,marginBottom:'4px',flexShrink:'0'});
      bedHdr.textContent='Airbnb homes by total bedrooms';
      card.appendChild(bedHdr);

      const tblHdr=document.createElement('div');
      Object.assign(tblHdr.style,{display:'flex',fontSize:'0.6rem',color:T.muted,borderBottom:'1px solid '+T.border,paddingBottom:'2px',marginBottom:'2px',flexShrink:'0'});
      tblHdr.innerHTML='<span style="flex:1;">Bedrooms</span><span style="width:50px;text-align:right;">Listings</span>';
      card.appendChild(tblHdr);

      const bedList=document.createElement('div');
      Object.assign(bedList.style,{display:'flex',flexDirection:'column',gap:'1px',flex:'1',overflowY:'auto'});
      BED_COUNT.forEach(b=>{
        const row=document.createElement('div');
        const isSel=selBed===b.beds;
        Object.assign(row.style,{display:'flex',fontSize:'0.65rem',cursor:'pointer',padding:'2px 3px',
          background:isSel?'#d6e8f5':'transparent',borderRadius:'2px',transition:'background 0.15s'});
        row.innerHTML='<span style="flex:1;color:'+T.text+';font-weight:'+(isSel?'700':'normal')+';text-decoration:'+(isSel?'underline':'none')+';">'+b.beds+'</span>'
          +'<span style="width:50px;text-align:right;color:'+T.muted+';">'+b.count.toLocaleString()+'</span>';
        row.addEventListener('click',()=>{ selBed=(selBed===b.beds?null:b.beds); build(root); });
        row.addEventListener('mouseenter',()=>{ if(selBed!==b.beds) row.style.background='#f0f0f0'; });
        row.addEventListener('mouseleave',()=>{ row.style.background=selBed===b.beds?'#d6e8f5':'transparent'; });
        bedList.appendChild(row);
      });
      card.appendChild(bedList);
      card.appendChild(axisLbl('Click a row to filter by bedroom count',{fontSize:'0.58rem',fontStyle:'italic',marginTop:'3px'}));
      rightCol.appendChild(card);
    }

    /* Right: Avg price by bedrooms (horizontal bars) */
    const BED_H=195;
    {
      const card=mkCard(BED_H);
      card.appendChild(secTitle('Avg Price by Bedroom total'));
      card.appendChild(axisLbl('Bedrooms',{textAlign:'left',marginBottom:'2px'}));
      const cv=mkCanvas('tb-bed',BED_H-44);
      card.appendChild(cv);
      card.appendChild(axisLbl('Avg Price ($)'));
      rightCol.appendChild(card);
      charts['bed']=new Chart(cv.getContext('2d'),{
        type:'bar',
        data:{
          labels:BED_PRICE.map(b=>b.beds),
          datasets:[{
            data:BED_PRICE.map(b=>b.price),
            backgroundColor:BED_PRICE.map(b=>selBed===b.beds?T.highlight:(selBed?'rgba(180,180,180,0.5)':T.navy)),
            borderWidth:0,barThickness:18,
          }],
        },
        options:{
          indexAxis:'y',responsive:false,animation:{duration:200},maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>'$'+ctx.raw+' avg/night'}}},
          onClick:(evt,els)=>{ if(els.length){ const b=BED_PRICE[els[0].index].beds; selBed=(selBed===b?null:b); build(root); } },
          scales:{
            x:{min:0,grid:{color:'rgba(0,0,0,0.06)'},ticks:{font:{size:9},color:T.muted,maxTicksLimit:5},border:{color:'rgba(0,0,0,0.15)'}},
            y:{grid:{display:false},ticks:{font:{size:10},color:T.text},border:{display:false}},
          },
          layout:{padding:{right:44}},
        },
        plugins:[{
          afterDatasetsDraw(chart){
            const ctx2=chart.ctx;
            chart.data.datasets[0].data.forEach((val,i)=>{
              const meta=chart.getDatasetMeta(0).data[i];
              if(!meta)return;
              ctx2.save(); ctx2.fillStyle=T.text; ctx2.font='9px Arial';
              ctx2.textAlign='left'; ctx2.textBaseline='middle';
              ctx2.fillText('$'+val.toFixed(1),meta.x+4,meta.y);
              ctx2.restore();
            });
          },
        }],
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════
     MOBILE: fully interactive, touch-optimized
     - Revenue line chart (auto-height, readable labels)
     - Zip tap-to-filter horizontal bar (top 10 shown, scrollable list)
     - Bedroom chips (large tap targets, toggle filter)
     - Bedroom price bar chart (shows filtered data)
     ══════════════════════════════════════════════════════════════ */
  function buildMobile(wrap,root){

    /* ── Revenue ─────────────────────────────────────────────── */
    {
      const card=mkCard(160);
      card.appendChild(secTitle('Weekly Revenue 2016 — Seattle Airbnb'));
      const cv=mkCanvas('tb-rev-m',118);
      card.appendChild(cv);
      card.appendChild(axisLbl('Peak: $2,110,350 (Dec 25 week)'));
      wrap.appendChild(card);
      charts['rev']=new Chart(cv.getContext('2d'),{
        type:'line',
        data:{labels:REV.labels,datasets:[{data:REV.values,borderColor:T.revLine,
          backgroundColor:'rgba(91,155,213,0.10)',fill:true,tension:0.35,pointRadius:0,borderWidth:2}]},
        options:{responsive:false,animation:false,maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{enabled:true,callbacks:{label:ctx=>'$'+(ctx.raw/1000).toFixed(0)+'K'}}},
          scales:{
            x:{grid:{display:false},ticks:{font:{size:8},color:T.muted,maxTicksLimit:6,maxRotation:0}},
            y:{ticks:{font:{size:9},color:T.muted,callback:v=>(v/1000).toFixed(0)+'K',maxTicksLimit:4},grid:{color:'rgba(0,0,0,0.06)'}},
          },
        },
      });
    }

    /* ── Zip tap-to-filter bar chart ─────────────────────────── */
    {
      const card=mkCard(230);
      const titleRow=document.createElement('div');
      Object.assign(titleRow.style,{display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:'0',marginBottom:'4px'});
      const t=document.createElement('div');
      Object.assign(t.style,{fontSize:'0.7rem',fontWeight:'600',color:T.text,lineHeight:'1.2'});
      t.textContent='Avg Price by Zip Code';
      const hint=document.createElement('div');
      Object.assign(hint.style,{fontSize:'0.6rem',color:T.muted,fontStyle:'italic'});
      hint.textContent='Tap bar to filter';
      titleRow.appendChild(t);
      titleRow.appendChild(hint);
      card.appendChild(titleRow);

      const cv=mkCanvas('tb-zip-m',185);
      card.appendChild(cv);
      wrap.appendChild(card);

      const zipBg=ZIP_DATA.map(z=>selZip===z.zip?T.highlight:(selZip?'rgba(180,180,180,0.4)':z.col));
      charts['zip']=new Chart(cv.getContext('2d'),{
        type:'bar',
        data:{
          labels:ZIP_DATA.map(z=>z.zip),
          datasets:[{data:ZIP_DATA.map(z=>z.price),backgroundColor:zipBg,borderWidth:0,maxBarThickness:14}],
        },
        options:{
          responsive:false,animation:{duration:250},maintainAspectRatio:false,
          plugins:{
            legend:{display:false},
            tooltip:{callbacks:{title:ctx=>ctx[0].label,label:ctx=>'$'+ctx.raw.toFixed(0)+'/night avg'}},
          },
          onClick:(evt,els)=>{
            if(els.length){const z=ZIP_DATA[els[0].index].zip;selZip=(selZip===z?null:z);build(root);}
          },
          scales:{
            x:{grid:{display:false},ticks:{font:{size:6},color:T.muted,maxRotation:90,minRotation:60}},
            y:{min:0,grid:{color:'rgba(0,0,0,0.06)'},ticks:{font:{size:9},color:T.muted,maxTicksLimit:4},border:{display:false}},
          },
        },
      });
    }

    /* ── Bedroom filter chips ────────────────────────────────── */
    {
      const card=mkCardAuto();
      const t=document.createElement('div');
      Object.assign(t.style,{fontSize:'0.7rem',fontWeight:'600',color:T.text,marginBottom:'8px'});
      t.textContent='Filter by Bedrooms — tap to select';
      card.appendChild(t);

      const chipRow=document.createElement('div');
      Object.assign(chipRow.style,{display:'flex',flexWrap:'wrap',gap:'8px'});

      BED_COUNT.forEach(b=>{
        const isSel=selBed===b.beds;
        const chip=document.createElement('button');
        chip.type='button';
        Object.assign(chip.style,{
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          minWidth:'50px',padding:'8px 12px',
          background:isSel?T.navy:'#f0f0f0',
          color:isSel?'#fff':T.text,
          border:'2px solid '+(isSel?T.navy:T.border),
          borderRadius:'8px',cursor:'pointer',
          fontSize:'0.75rem',fontWeight:'700',
          touchAction:'manipulation',
          transition:'background 0.18s,border-color 0.18s,color 0.18s',
          flexShrink:'0',lineHeight:'1.2',
        });
        chip.innerHTML='<span style="font-size:1rem;font-weight:800;">'+b.beds+'</span><span style="font-size:0.6rem;font-weight:500;opacity:0.75;">bed'+(b.beds>1?'s':'')+'</span>';
        chip.title=b.count.toLocaleString()+' listings';
        chip.addEventListener('click',()=>{ selBed=(selBed===b.beds?null:b.beds); build(root); });
        chipRow.appendChild(chip);
      });
      card.appendChild(chipRow);

      /* Listing count below chips */
      if(selBed){
        const found=BED_COUNT.find(b=>b.beds===selBed);
        const note=document.createElement('div');
        Object.assign(note.style,{fontSize:'0.65rem',color:T.blue,marginTop:'8px',fontWeight:'600'});
        note.textContent=(found?found.count.toLocaleString():'0')+' listings with '+selBed+' bedroom'+(selBed>1?'s':'');
        card.appendChild(note);
      }
      wrap.appendChild(card);
    }

    /* ── Avg price by bedrooms bar (responds to selBed) ─────── */
    {
      const card=mkCard(190);
      card.appendChild(secTitle('Avg Nightly Price by Bedroom Count'));
      card.appendChild(axisLbl('Bedrooms',{textAlign:'left',marginBottom:'2px'}));
      const cv=mkCanvas('tb-bed-m',148);
      card.appendChild(cv);
      wrap.appendChild(card);
      charts['bed']=new Chart(cv.getContext('2d'),{
        type:'bar',
        data:{
          labels:BED_PRICE.map(b=>b.beds+' bed'+(b.beds>1?'s':'')),
          datasets:[{
            data:BED_PRICE.map(b=>b.price),
            backgroundColor:BED_PRICE.map(b=>selBed===b.beds?T.highlight:(selBed?'rgba(180,180,180,0.45)':T.navy)),
            borderWidth:0,barThickness:22,
          }],
        },
        options:{
          indexAxis:'y',responsive:false,animation:{duration:250},maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>'$'+ctx.raw+' avg/night'}}},
          onClick:(evt,els)=>{if(els.length){const b=BED_PRICE[els[0].index].beds;selBed=(selBed===b?null:b);build(root);}},
          scales:{
            x:{min:0,grid:{color:'rgba(0,0,0,0.06)'},ticks:{font:{size:9},color:T.muted,maxTicksLimit:4},border:{display:false}},
            y:{grid:{display:false},ticks:{font:{size:10},color:T.text,weight:'500'},border:{display:false}},
          },
          layout:{padding:{right:50}},
        },
        plugins:[{
          afterDatasetsDraw(chart){
            const ctx2=chart.ctx;
            chart.data.datasets[0].data.forEach((val,i)=>{
              const meta=chart.getDatasetMeta(0).data[i];
              if(!meta)return;
              ctx2.save();
              ctx2.fillStyle=T.text;
              ctx2.font='bold 9px Arial';
              ctx2.textAlign='left';
              ctx2.textBaseline='middle';
              ctx2.fillText('$'+val.toFixed(0),meta.x+5,meta.y);
              ctx2.restore();
            });
          },
        }],
      });
    }
  }

  /* ── Mount + ResizeObserver ─────────────────────────────── */
  function init(root){
    build(root);
    let lastW=root.offsetWidth;
    const ro=new ResizeObserver(entries=>{
      const newW=Math.round(entries[0].contentRect.width);
      if(Math.abs(newW-lastW)>20){lastW=newW;build(root);}
    });
    ro.observe(root);
  }

  function waitForChartJS(cb,t){
    t=t||0; if(window.Chart)return cb();
    if(t>40)return; setTimeout(()=>waitForChartJS(cb,t+1),150);
  }

  document.addEventListener('DOMContentLoaded',()=>{const r=document.getElementById('tableau-replica');if(r)waitForChartJS(()=>init(r));});
  if(document.readyState!=='loading'){const r=document.getElementById('tableau-replica');if(r)waitForChartJS(()=>init(r));}
})();
