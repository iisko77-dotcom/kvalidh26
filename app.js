import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getDatabase, ref, push, set, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';
import * as L from 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js';
const $ = id => document.getElementById(id);
const map = L.map('map').setView([58.85, 25.3], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19
}).addTo(map);
const markers = L.layerGroup().addTo(map);
let fixed = [], remote = [], selected = null, myMarker = null, pickMode = false;
const configured = firebaseConfig.apiKey !== 'ASENDA' && !firebaseConfig.databaseURL.includes('ASENDA');
let database = null;
function status(message) { $('status').textContent = message; }
function normalize(row, source) {
  const lat = Number(row.lat), lng = Number(row.lng);
  if (!row.nimi || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat)>90 || Math.abs(lng)>180) return null;
  return { nimi: String(row.nimi).slice(0,80), kirjeldus: String(row.kirjeldus||'').slice(0,300), lat, lng, source };
}
function setSelected(latlng) {
  selected = latlng;
  if (!myMarker) {
    myMarker = L.marker(latlng, { draggable:true, icon: L.divIcon({className:'', html:'<div class="user-dot"></div>',iconSize:[18,18],iconAnchor:[9,9]}) }).addTo(map);
    myMarker.on('drag', () => { selected=myMarker.getLatLng(); render(); });
  } else myMarker.setLatLng(latlng);
  render();
}
map.on('click', e => {
  if (pickMode) {
    $('lat').value=e.latlng.lat.toFixed(6); $('lng').value=e.latlng.lng.toFixed(6);
    pickMode=false; $('pick').textContent='Vali lisatava koha punkt'; status('Koordinaadid valitud. Sisesta nimi ja salvesta.');
  } else setSelected(e.latlng);
});
$('pick').onclick=()=>{pickMode=!pickMode; $('pick').textContent=pickMode?'Klõpsa nüüd kaardil…':'Vali lisatava koha punkt';};
$('clear').onclick=()=>{selected=null;if(myMarker){map.removeLayer(myMarker);myMarker=null;}render();};
$('reset').onclick=()=>map.setView([58.85,25.3],7);
function cell(tr, text) { const td=document.createElement('td');td.textContent=text;tr.append(td);return td; }
function render() {
  markers.clearLayers(); const rows=[...fixed,...remote];
  const ranked=rows.map(p=>({...p, km:selected?map.distance(selected,[p.lat,p.lng])/1000:null}));
  if(selected) ranked.sort((a,b)=>a.km-b.km);
  const body=$('places');body.replaceChildren();
  for (const p of ranked) {
    const marker=L.marker([p.lat,p.lng]).addTo(markers);
    const popup=document.createElement('div');const strong=document.createElement('strong');strong.textContent=p.nimi;popup.append(strong);
    const desc=document.createElement('p');desc.textContent=p.kirjeldus;popup.append(desc);
    if(p.km!==null){const d=document.createElement('p');d.textContent=`Kaugus sinu punktist: ${p.km.toFixed(1)} km`;popup.append(d);}
    marker.bindPopup(popup);
    const tr=document.createElement('tr');const name=cell(tr,p.nimi);name.style.fontWeight='700';
    cell(tr,p.kirjeldus);cell(tr,`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`);cell(tr,p.source);
    const distance=cell(tr,p.km===null?'Vali kaardil asukoht':`${p.km.toFixed(1)} km`);
    if(p.km!==null) distance.className='pill';
    tr.style.cursor='pointer';tr.title='Näita kohta kaardil';tr.onclick=()=>{map.setView([p.lat,p.lng],11);marker.openPopup();};body.append(tr);
  }
  $('count').textContent=`Kokku ${rows.length} kohta · Failist ${fixed.length} · Andmebaasist ${remote.length}`;
  $('chosen').textContent=selected?`Sinu punkt: ${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)} · Kohad järjestatud kauguse järgi`:'Asukoht pole veel valitud.';
}
async function loadFixed() {
  try {
    const response=await fetch('./asukoht.txt', {cache:'no-store'});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const text=await response.text();
    fixed=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).slice(1).map(line=>{
      const [nimi,kirjeldus,lat,lng]=line.split(';');return normalize({nimi,kirjeldus,lat,lng},'TXT');
    }).filter(Boolean);render();
  } catch(err) {status('TXT faili laadimine ebaõnnestus. Ava leht veebiserveri kaudu.');console.error(err);}
}
loadFixed();
if(configured) {
  try {
    const app=initializeApp(firebaseConfig);database=getDatabase(app);
    onValue(ref(database,'vaatamisvaarsused'),snapshot=>{
      remote=Object.values(snapshot.val()||{}).map(row=>normalize(row,'Firebase')).filter(Boolean);render();
      status('Andmebaasiga ühendatud.');
    },err=>{status('Firebase lugemine ebaõnnestus: '+err.message);});
  } catch(err) {status('Firebase seadistusvigа: '+err.message);}
} else status('Näidisandmed töötavad. Salvestamiseks lisa firebase-config.js faili oma Firebase seaded.');
$('add-form').onsubmit=async event=>{
  event.preventDefault();
  if(!database){status('Enne salvestamist seadista Firebase.');return;}
  const nimi=$('nimi').value.trim(), kirjeldus=$('kirjeldus').value.trim();
  const lat=Number($('lat').value),lng=Number($('lng').value);
  if(!nimi||!$('lat').value||!$('lng').value||!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180){status('Kontrolli nime ja koordinaate.');return;}
  $('save').disabled=true;status('Salvestan...');
  try {
    await set(push(ref(database,'vaatamisvaarsused')), {nimi,kirjeldus,lat,lng,createdAt:serverTimestamp()});
    $('add-form').reset();status('Salvestatud! Uus koht ilmub kaardile ja tabelisse.');
  } catch(err){status('Salvestamine ebaõnnestus: '+err.message);}finally{$('save').disabled=false;}
};
