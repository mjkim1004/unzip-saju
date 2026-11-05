/* 운.zip deterministic rules v4.1+unzip.1. All display data derives from this engine. */
const Saju = (() => {
  const G='甲乙丙丁戊己庚辛壬癸'.split(''), Z='子丑寅卯辰巳午未申酉戌亥'.split('');
  const GK='갑을병정무기경신임계'.split(''), ZK='자축인묘진사오미신유술해'.split('');
  const E=['목','화','토','금','수'], EC=['#7DAE87','#DE6B6B','#E2A93E','#C3C7CD','#667EAC'];
  const BE=[4,2,0,0,2,1,1,2,3,3,2,4], BG=[9,5,0,1,4,2,3,5,6,7,4,8];
  const roleNames=['용신','희신','한신','기신','구신'], roleValues=[15,8,0,-12,-15];
  const fields=['직장·승진','이직·취업','사업·창업','금전','애정·결혼','학업·시험','건강','인간관계'];
  const termsNames=['','소한','입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설'];
  const mod=(a,b)=>((a%b)+b)%b, clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
  const MS=86400000, pad=n=>String(n).padStart(2,'0');
  const iso=ms=>new Date(ms).toISOString().slice(0,10), dayms=s=>Date.parse(s+'T00:00:00Z');
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const addDays=(s,n)=>iso(dayms(s)+n*MS);
  const pair=i=>({g:mod(i,10),z:mod(i,12)});
  const index=p=>Array.from({length:60},(_,i)=>i).find(i=>i%10===p.g&&i%12===p.z);
  const text=p=>p?G[p.g]+Z[p.z]:'—';
  const ko=p=>p?GK[p.g]+ZK[p.z]:'시주 불명';
  const dayPair=s=>pair(mod(Math.floor(dayms(s)/MS)+2440588+49,60));
  const dateKST=ms=>new Date(ms+9*3600000).toISOString().slice(0,16).replace('T',' ');
  const grade=n=>n>=70?['좋음','#0066FF']:n>=55?['괜찮음','#66A3FF']:n>=40?['보통','#C9D1DB']:n>=25?['조심','#FF9F43']:['지키기','#E4002B'];
  function lastTerm(ms) { let lo=0,hi=CAL.terms.length-1;while(lo<hi){let mid=Math.ceil((lo+hi)/2);if(CAL.terms[mid][0]<=ms)lo=mid;else hi=mid-1;}return CAL.terms[lo]; }
  function yearMonth(ms){
    const k=new Date(ms+9*3600000), y=k.getUTCFullYear();
    const spring=CAL.terms.find(t=>t[1]===2 && new Date(t[0]).getUTCFullYear()===y);
    if(!spring)throw Error('지원 범위 밖의 날짜예요. 1900~2050년 출생을 입력해 주세요.');
    const yp=pair(y-(ms<spring[0]?1:0)-4), term=lastTerm(ms), z=term[1]%12;
    const monthOffset=mod(z-2,12), g=mod((yp.g%5)*2+2+monthOffset,10);
    return {year:yp,month:{g,z},term};
  }
  function lunarToSolar(y,m,d,leap){const row=CAL.lunar.find(r=>r[0]===y&&r[1]===m&&r[2]===Number(leap));if(!row||d<1||d>row[4])throw Error('존재하지 않는 음력 날짜예요. 평달·윤달과 날짜를 확인해 주세요.');return addDays(row[3],d-1);}
  function offsetAt(ms,tz){
    const f=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
    const p=Object.fromEntries(f.formatToParts(new Date(ms)).map(x=>[x.type,x.value]));
    return (Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)-Math.floor(ms/1000)*1000)/60000;
  }
  function localToUTC(s,time,tz){
    const wall=Date.parse(s+'T'+time+':00Z');
    if(tz==='Asia/Seoul'&&s<'1908-04-01')return {ms:wall-540*60000,offset:540,ambiguous:false};
    let offsets=new Set([-MS,0,MS].map(d=>offsetAt(wall+d,tz)));
    const valid=[...offsets].map(o=>({ms:wall-o*60000,offset:o})).filter(v=>Math.abs(v.ms+offsetAt(v.ms,tz)*60000-wall)<1000).sort((a,b)=>a.ms-b.ms);
    if(!valid.length)throw Error('서머타임 전환으로 존재하지 않는 현지 시각이에요. 출생 기록을 확인해 주세요.');
    return {...valid[0],ambiguous:valid.length>1};
  }
  function tenGod(dm,g){const rel=mod(Math.floor(g/2)-Math.floor(dm/2),5),same=g%2===dm%2;return [['비견','겁재'],['식신','상관'],['편재','정재'],['편관','정관'],['편인','정인']][rel][same?0:1];}
  function roles(dm,strong){const e=Math.floor(dm/2),arr=Array(5).fill(0); const order=strong?[mod(e+1,5),mod(e+2,5),mod(e+3,5),e,mod(e+4,5)]:[mod(e+4,5),e,mod(e+3,5),mod(e+2,5),mod(e+1,5)];order.forEach((x,i)=>arr[x]=i);return arr;}
  function chart(input){
    if(!input.date||!input.gender||(!input.time&&!input.unknown))throw Error('생년월일, 출생 시각(또는 모름), 성별을 입력해 주세요.');
    const [y,m,d]=input.date.split('-').map(Number);if(y<1900||y>2050)throw Error('출생 연도는 1900~2050년까지 지원해요.');
    let solar=input.calendar==='lunar'?lunarToSolar(y,m,d,input.leap):input.date;
    if(iso(dayms(solar))!==solar)throw Error('존재하는 날짜를 입력해 주세요.');
    if(solar>today())throw Error('출생일은 오늘 이전의 날짜여야 해요.');
    const tz=input.zone||'Asia/Seoul', converted=localToUTC(solar,input.unknown?'12:00':input.time,tz);
    if(converted.ambiguous)throw Error('이 시각은 서머타임 해제로 두 번 존재해요. 정확한 UTC 시각을 확인한 뒤 시간대를 Etc/GMT 형식으로 지정해 주세요.');
    const ms=converted.ms,kst=new Date(ms+9*3600000),ks=iso(ms+9*3600000),h=kst.getUTCHours(),min=kst.getUTCMinutes();
    const ym=yearMonth(ms),dp=dayPair(h>=23?addDays(ks,1):ks),hz=Math.floor((h+1)/2)%12;
    const hp=input.unknown?null:{g:mod((dp.g%5)*2+hz,10),z:hz};
    const pillars=[ym.year,ym.month,dp,hp],present=pillars.filter(Boolean);
    const nearest=CAL.terms.reduce((a,t)=>Math.abs(t[0]-ms)<Math.abs(a[0]-ms)?t:a,CAL.terms[0]);
    if(!input.unknown&&Math.abs(nearest[0]-ms)<60000)throw Error('절입 시각과 1분 이내라 천문 계산 오차로 명식이 달라질 수 있어요. 확정을 멈추고 출생 기록과 절입 기준표 확인이 필요해요.');
    if(input.unknown&&Math.abs(nearest[0]-ms)<12*3600000)throw Error('절입일 출생이라 시각 없이는 년주·월주를 확정할 수 없어요. 출생 시각을 확인해 주세요.');
    const boundary=Math.abs(nearest[0]-ms)<MS||(!input.unknown&&Math.min(mod((h*60+min)-60,120),120-mod((h*60+min)-60,120))<=10);
    const counts=[0,0,0,0,0];present.forEach(p=>{counts[Math.floor(p.g/2)]++;counts[BE[p.z]]++;});
    const support=[Math.floor(dp.g/2),mod(Math.floor(dp.g/2)+4,5)];let total=0,hit=0;
    pillars.forEach((p,i)=>{if(!p)return;for(const [e,w] of [[Math.floor(p.g/2),1],[BE[p.z],i===1?3:1]]){total+=w;if(support.includes(e))hit+=w;}});
    const strength=Math.round(hit/total*100), strong=strength>50;
    const forward=(ym.year.g%2===0)===(input.gender==='male');
    const near=forward?CAL.terms.find(t=>t[0]>ms):lastTerm(ms);
    const diff=Math.abs(near[0]-ms)/MS, whole=Math.floor(diff), startAge=Math.max(1,Math.floor(whole/3)+(whole%3===2?1:0));
    const checks=[
      {label:'년간·월간 년상기월법',ok:ym.month.g===mod((ym.year.g%5)*2+2+mod(ym.month.z-2,12),10)},
      {label:'일간·시간 일상기시법',ok:!hp||hp.g===mod((dp.g%5)*2+hp.z,10),note:!hp?'시주 불명 · 시주 검증 제외':''},
      {label:'월지와 절입 구간',ok:ym.month.z===ym.term[1]%12},
      {label:'60갑자 실재·일주 앵커 2개',ok:present.every(p=>index(p)!==undefined)&&index(dayPair('1949-10-01'))===0&&index(dayPair('2000-01-01'))===54},
      {label:'대운 방향',ok:true,note:forward?'순행':'역행'},
      {label:'대운수',ok:startAge>=1&&startAge<=10,note:`절입 간격 ${diff.toFixed(3)}일 → ${startAge}세`},
      {label:'표준시·서머타임',ok:true,note:`${tz} UTC${converted.offset>=0?'+':''}${converted.offset/60} → KST +9`},
      {label:'절입·시지 경계 검사',ok:true,note:boundary?'경계 출생 · 확신도 C':'경계 밖'}
    ];
    if(checks.some(c=>!c.ok))throw Error('명식 검증을 통과하지 못했어요. 입력과 계산 기준을 확인해 주세요.');
    const now=today(),age=+now.slice(0,4)-+solar.slice(0,4)-(now.slice(5)<solar.slice(5)?1:0);
    const charTotal=counts.reduce((a,b)=>a+b,0),percentages=counts.map(n=>Math.floor(n/charTotal*100));
    const remainders=counts.map((n,i)=>({i,r:n/charTotal*100-percentages[i]})).sort((a,b)=>b.r-a.r||a.i-b.i);
    for(let i=0,n=100-percentages.reduce((a,b)=>a+b,0);i<n;i++)percentages[remainders[i].i]++;
    return {input:{...input,zone:tz},solar,kst:dateKST(ms),ms,pillars,dm:dp.g,counts,percentages,strength,strong,roles:roles(dp.g,strong),boundary,nearestTerm:{name:termsNames[nearest[1]],time:dateKST(nearest[0]),deltaMinutes:Math.round((ms-nearest[0])/60000)},lateZi:h===23&&!input.unknown,forward,startAge,age,checks,provisional:strength>=45&&strength<=55};
  }
  function daewoon(c,s){const age=(dayms(s)-dayms(c.solar))/(MS*365.2425),n=Math.floor((age-c.startAge)/10);return n<0?{pair:null,start:+c.solar.slice(0,4),end:+c.solar.slice(0,4)+c.startAge,pre:true}:{pair:pair(index(c.pillars[1])+(c.forward?1:-1)*(n+1)),start:+c.solar.slice(0,4)+c.startAge+n*10,end:+c.solar.slice(0,4)+c.startAge+(n+1)*10,pre:false};}
  const triples=[[[8,0,4],4],[[11,3,7],0],[[2,6,10],1],[[5,9,1],3],[[2,3,4],0],[[5,6,7],1],[[8,9,10],3],[[11,0,1],4]];
  const six=[[[0,1],2],[[2,11],0],[[3,10],1],[[4,9],3],[[5,8],4],[[6,7],2]];
  const breaks=[[0,9],[1,4],[2,11],[3,6],[5,8],[7,10]], harms=[[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]],wonjin=[[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];
  const hasPair=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b)&&a!==b);
  function core(c,p,extra){
    const natal=c.pillars.filter(Boolean),others=[...natal,...(extra?[extra]:[])], zs=others.map(x=>x.z),gs=others.map(x=>x.g);
    const role=e=>roleValues[c.roles[e]],sgn=e=>Math.sign(role(e)),logs=[];let total=50;
    const add=(name,n)=>{if(n){total+=n;logs.push({name,value:Math.round(n*10)/10});}};
    const ix=index(c.pillars[2]),voids=[mod(10-2*Math.floor(ix/10),12),mod(11-2*Math.floor(ix/10),12)],isVoid=voids.includes(p.z);
    add('천간 역할',role(Math.floor(p.g/2)));add('지지 역할'+(isVoid?' × 0.7':''),role(BE[p.z])*(isVoid?.7:1));
    const all=[...zs,p.z];
    for(const [group,e] of triples){if(!group.includes(p.z))continue;const n=group.filter(z=>all.includes(z)).length;if(n===3)add('삼합·방합 완성',sgn(e)*15);else if(n===2)add('반합',sgn(e)*8);}
    for(const [group,e] of six)if(group.includes(p.z)&&zs.includes(group.find(z=>z!==p.z)))add('육합',sgn(e)*5);
    if(gs.includes((p.g+5)%10))add('천간합',sgn([2,3,4,0,1][p.g%5])*5);
    natal.forEach((o,i)=>{if(mod(o.z-p.z,12)===6)add(i===2?'일지 충':'지지 충',i===2?-12:-8);});
    if(extra&&mod(extra.z-p.z,12)===6)add('대운 지지 충',-8);
    let attack=0;for(const o of others){const a=Math.floor(p.g/2),b=Math.floor(o.g/2);if(mod(b-a,5)===2)attack+=role(b)<0?8:role(b)>0?-8:0;if(mod(a-b,5)===2)attack+=role(a)<0?8:role(a)>0?-8:0;}add('천간극 (±8 제한)',clamp(attack,-8,8));
    for(const group of [[2,5,8],[1,7,10]])if(group.includes(p.z)){const n=group.filter(z=>all.includes(z)).length;if(n===3)add('삼형',-12);else if(n===2)add('상형',-8);}
    if((p.z===0&&zs.includes(3))||(p.z===3&&zs.includes(0)))add('자묘형',-8);
    if([4,6,9,11].includes(p.z)&&zs.includes(p.z))add('자형',-3);
    let damage=0;for(const z of new Set(zs)){if(hasPair(breaks,p.z,z))damage-=3;if(hasPair(harms,p.z,z))damage-=4;if(hasPair(wonjin,p.z,z))damage-=5;}add('파·해·원진 (−8 제한)',Math.max(-8,damage));
    if(others.some(o=>o.g===p.g&&o.z===p.z))add('복음',c.roles[BE[p.z]]===0?3:c.roles[BE[p.z]]>=3?-5:0);
    const starts=[11,6,2,9,2,9,5,0,8,3],stage=mod((p.z-starts[c.dm])*(c.dm%2===0?1:-1),12),stages=['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
    add('12운성 · '+stages[stage],[5,0,10,10,10,0,-5,-5,-10,-10,-10,0][stage]);
    if(isVoid)add('공망',-5);
    const climate=climateScore(c,p);add('조후',climate);
    return {score:Math.round(clamp(total)),logs,void:isVoid,stage:stages[stage],climate,pair:p};
  }
  function climateScore(c,p){const season=c.pillars[1].z,es=[Math.floor(p.g/2),BE[p.z]];let wanted=-1,bad=-1;if([11,0,1].includes(season)){wanted=1;bad=4;}if([5,6,7].includes(season)){wanted=4;bad=1;}if([8,9,10].includes(season)){wanted=4;bad=2;}if(wanted<0)return 0;const n=es.filter(e=>e===wanted).length;return n?Math.min(10,5*n):es.includes(bad)?-5:0;}
  function fieldsFor(c,p,base,raw){
    const gods=[tenGod(c.dm,p.g),tenGod(c.dm,BG[p.z])],has=s=>gods.some(g=>s.includes(g));
    const natal=c.pillars.filter(Boolean),natalGods=natal.flatMap(x=>[tenGod(c.dm,x.g),tenGod(c.dm,BG[x.z])]);
    const is=(g,list)=>list.some(x=>g.includes(x)),wealth=has(['편재','정재']),resource=has(['편인','정인']),out=has(['식신','상관']),peer=has(['비견','겁재']),officer=has(['편관','정관']);
    const dayClash=mod(p.z-c.pillars[2].z,12)===6,join=hasPair(six.map(x=>x[0]),p.z,c.pillars[2].z);
    const roleClash=types=>natal.some(x=>mod(x.z-p.z,12)===6&&types.includes(tenGod(c.dm,BG[x.z])));
    const officerClash=roleClash(['정관','편관']),resourceClash=roleClash(['정인','편인']);
    const groupZ=c.pillars[2].z,travel=[2,11,8,5][groupZ%4],peach=[9,6,3,0][groupZ%4],canopy=[4,1,10,7][groupZ%4];
    const noble=[[1,7],[0,8],[11,9],[11,9],[1,7],[0,8],[1,7],[2,6],[3,5],[3,5]][c.dm];
    const literary=[5,6,8,9,8,9,11,0,2,3][c.dm];
    const peers=natalGods.filter(g=>['비견','겁재'].includes(g)).length,rob=peer?(peers>=3?-12:-8):0;
    const corrections=[0,0,0,0,0,0,0,0],notes=fields.map(()=>[]),add=(f,label,n)=>{if(n){corrections[f]+=n;notes[f].push({name:label,value:n});}};
    if(!c.strong){if(has(['정관']))add(0,'정관',8);if(resource)add(0,'인성',5);if(has(['편관']))add(0,'신약 편관',-5);}else{if(has(['편관']))add(0,'편관',5);if(out)add(0,'식상',5);}
    if(has(['상관'])&&natalGods.includes('정관')||has(['정관'])&&natalGods.includes('상관'))add(0,'상관견관',-10);if(officerClash)add(0,'관성 자리 충',-8);
    if(p.z===travel)add(1,'역마',8);if(officer)add(1,'관성',5);if(out)add(1,'식상',5);if(!officerClash)add(1,'이동 동력',-5);if(peer)add(1,'경쟁',-5);
    if(out&&natalGods.some(g=>['편재','정재'].includes(g))||wealth&&natalGods.some(g=>['식신','상관'].includes(g)))add(2,'식상생재',10);if(wealth&&c.strong)add(2,'재성',8);add(2,'비겁',rob);if(wealth&&!c.strong&&natalGods.filter(g=>['편재','정재'].includes(g)).length>=3)add(2,'재성 과다',-5);
    if(wealth)add(3,'재성',c.strong?10:5);if(out&&c.strong)add(3,'식상',5);add(3,'비겁',rob);
    const tomb=[7,10,10,1,4][mod(Math.floor(c.dm/2)+2,5)];if(natal.some(x=>x.z===tomb)&&mod(tomb-p.z,12)===6)add(3,'재고 충',c.strong?8:-8);
    if(c.input.gender==='male'?wealth:officer)add(4,'배우자성',10);if(p.z===peach)add(4,'도화',5);if(join)add(4,'일지 합',8);if(dayClash)add(4,'일지 충',-12);if(c.input.gender==='male'&&peer||c.input.gender==='female'&&has(['상관']))add(4,'관계 긴장',-5);
    if(resource)add(5,'인성',10);if(p.z===literary)add(5,'문창',8);if(has(['식신']))add(5,'식신',5);if(p.z===canopy)add(5,'화개',3);if(wealth)add(5,'재극인',-8);if(resourceClash)add(5,'인성 자리 충',-8);
    if(raw.climate>0)add(6,'조후 보완',8);if(raw.climate<0)add(6,'조후 악화',-8);if(resource&&!c.strong)add(6,'인성',5);if(dayClash||raw.logs.some(l=>l.name.includes('형')))add(6,'충·형',-12);if(!c.strong&&officer)add(6,'관살',-8);if(['병','사','묘','절'].includes(raw.stage))add(6,'12운성',-5);
    if(noble.includes(p.z))add(7,'천을귀인',10);if(resource)add(7,'인성',5);if(has(['비견']))add(7,'비견',c.strong?-5:5);if(has(['겁재']))add(7,'겁재',-5);if(natal.some(x=>hasPair(wonjin,p.z,x.z)||hasPair(harms,p.z,x.z)))add(7,'원진·해',-8);
    return corrections.map((v,i)=>({score:Math.round(clamp(base+clamp(v,-25,25))),correction:clamp(v,-25,25),logs:notes[i]}));
  }
  function score(c,s,layer='day'){
    const ms=dayms(s)+3*3600000,ym=yearMonth(ms),dw=daewoon(c,s),dscore=dw.pre?50:core(c,dw.pair,null).score;
    const month=core(c,ym.month,dw.pair),mb=dscore*.6+month.score*.4;
    const p=layer==='year'?ym.year:layer==='month'?ym.month:dayPair(s),raw=core(c,p,dw.pair);
    const base=layer==='day'?raw.score*.7+mb*.3:dscore*.6+raw.score*.4;
    return {date:s,score:Math.round(base),fields:fieldsFor(c,p,base,raw),raw,monthBase:Math.round(mb),daewoon:dscore,daewoonInfo:dw,confidence:layer==='day'||c.input.unknown||c.boundary?'C':'B',holiday:CAL.holidays[s]||null};
  }
  function ageSituation(age){return age<=19?'student':age<30?'job':age<60?'worker':'rest';}
  const situationFields={worker:[0,3,2,4],business:[2,3,7,6],job:[1,5,3,4],student:[5,0,4,6],rest:[6,3,7,4]};
  function periodRange(key,now=today()){
    const [y,m]=now.split('-').map(Number),monthStart=`${y}-${pad(m)}-01`;let start=now,end=now;
    if(key==='week')end=addDays(now,6);
    if(key==='month'){start=monthStart;end=iso(Date.UTC(y,m,0));}
    if(key==='quarter'){start=monthStart;end=iso(Date.UTC(y,m+2,0));}
    if(key==='year'){start=monthStart;end=`${y}-12-31`;}
    if(key==='next'){start=`${y+1}-01-01`;end=`${y+1}-12-31`;}
    if(key==='long'){start=monthStart;end=`${y+4}-12-31`;}
    return {start,end};
  }
  function resolveEvents(c,events){if(!c.provisional||events.length<2)return;const alternatives=[false,true].map(strong=>{const cc={...c,strong,roles:roles(c.dm,strong)};let fit=0;for(const e of events){const v=score(cc,`${e.year}-07-15`,'year').score;fit+=(v-50)*(e.kind==='good'?1:-1);}return {strong,fit};});alternatives.sort((a,b)=>b.fit-a.fit);c.eventComparison=alternatives;if(alternatives[0].fit!==alternatives[1].fit){c.strong=alternatives[0].strong;c.roles=roles(c.dm,c.strong);c.provisional=false;c.resolvedBy='입력한 과거 사건 2~3개와 두 역할표 대조';}}
  function eligible(row,field,profile){if(field>3)return true;if(row.holiday)return false;const day=new Date(dayms(row.date)).getUTCDay();return profile.weekendBusiness||day!==0&&day!==6;}
  function natalScores(c){
    const natal=c.pillars.filter(Boolean),dmE=Math.floor(c.dm/2),targets=[3,3,2,2,c.input.gender==='male'?2:3,4,0,4];
    return targets.map(rel=>{const element=mod(dmE+rel,5),count=c.counts[element],role=c.roles[element],adequacy=count===0?-20:count===1?-10:count<=3?20:5;
      const roleAdjust=role===0?15:role===1?8:role>=3?-15:0;
      let hits=0;for(let i=0;i<natal.length;i++)for(let j=i+1;j<natal.length;j++)if(BE[natal[i].z]===element||BE[natal[j].z]===element){if(mod(natal[i].z-natal[j].z,12)===6||hasPair(harms,natal[i].z,natal[j].z)||hasPair(breaks,natal[i].z,natal[j].z)||hasPair([[0,3],[2,5],[5,8],[2,8],[1,7],[7,10],[1,10]],natal[i].z,natal[j].z))hits++;}
      const noble=[[1,7],[0,8],[11,9],[11,9],[1,7],[0,8],[1,7],[2,6],[3,5],[3,5]][c.dm];
      const helpers=Math.min(10,natal.filter(p=>noble.includes(p.z)&&BE[p.z]===element).length*5),root=natal.some(p=>BE[p.z]===element)?5:-5;
      return {score:clamp(50+adequacy+roleAdjust-Math.min(15,hits*5)+helpers+root),logs:{adequacy,role:roleAdjust,damage:-Math.min(15,hits*5),helpers,root},element};
    });
  }
  function report(c,profile){
    const now=today();if(+now.slice(0,4)>2050)throw Error('달력 데이터 갱신이 필요해요. 지원 접속 연도는 2050년까지예요.');
    resolveEvents(c,profile.events||[]);const range=periodRange(profile.period,now),days=[];
    for(let s=range.start;s<=range.end;s=addDays(s,1))days.push(score(c,s));
    const months=[];for(let s=range.start.slice(0,7)+'-01';s<=range.end;){const [y,m]=s.split('-').map(Number);months.push({...score(c,s.slice(0,7)+'-15','month'),key:s.slice(0,7)});s=iso(Date.UTC(y,m,1));}
    const years=[];for(let y=+range.start.slice(0,4);y<=+range.end.slice(0,4);y++)years.push({...score(c,`${y}-07-15`,'year'),year:y});
    const comparisons=(profile.dates||[]).map(s=>({...score(c,s),eligible:eligible(score(c,s),profile.fields[0],profile)}));
    const data={version:CAL.version,created:now,profile:{...profile,birth:c.input},chart:c,originFields:natalScores(c),range,today:score(c,now),days,months,years,comparisons};
    data.average=Math.round(days.reduce((a,r)=>a+r.score,0)/days.length);return data;
  }
  function advice(row,f,situation){
    const score=f==='all'?row.score:row.fields[Number(f)].score, high=score>=55;
    const map=[['성과를 짧게 정리하고 피드백 받기','확인하지 않은 일정 약속'],['지원서 한 곳을 골라 완성하기','조건 확인 없는 결정'],['작은 규모로 제안 반응 확인하기','비용을 한꺼번에 늘리기'],['수입·지출과 계약 조건 점검하기','충동적인 투자·대출 결정'],['기대하는 것을 구체적으로 말하기','답을 짐작하고 단정하기'],['기출 한 회와 오답 정리하기','계획만 늘리고 수면 줄이기'],['수면과 휴식 시간을 먼저 확보하기','컨디션을 무시한 무리한 일정'],['필요한 부탁을 짧고 분명하게 하기','확인 전 다른 사람 뜻 단정하기']];
    const active=f==='all'?(situation==='student'?5:0):Number(f),a=map[active];return {do:high?a[0]:active===6?'휴식과 일상 루틴 유지하기':'진행 중인 일을 한 가지씩 점검하기',avoid:a[1]};
  }
  return {G,Z,GK,ZK,E,EC,BE,BG,fields,roleNames,roleValues,termsNames,mod,clamp,iso,dayms,today,addDays,text,ko,index,dayPair,yearMonth,lunarToSolar,localToUTC,dateKST,grade,chart,score,report,core,roles,tenGod,daewoon,ageSituation,situationFields,periodRange,eligible,advice};
})();
if(typeof module!=='undefined')module.exports=Saju;
