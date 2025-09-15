const h = React.createElement;

function AssetDetail() {
  const { useEffect, useState } = React;
  const assetId = window.ASSET_ID;
  const [asset, setAsset] = useState(null);
  const [missions, setMissions] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [error, setError] = useState(null);

  const load = () => {
    fetch('/api/assets/' + assetId).then(r=>r.json()).then(setAsset);
    fetch('/api/missions').then(r=>r.json()).then(setMissions);
    fetch(`/api/assets/${assetId}/missions`).then(r=>r.json()).then(setAssigned);
  };

  useEffect(() => { load(); }, []);

  const isAssigned = (missionId) => assigned.some(m => m.id === missionId);

  const toggle = (missionId, checked) => {
    const url = `/api/assets/${assetId}/missions` + (checked ? '' : `/${missionId}`);
    const opts = checked ? { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ missionId }) } : { method:'DELETE' };
    fetch(url, opts).then(res=>{ if(!res.ok) throw new Error('Fehler beim Speichern'); }).then(()=>load()).catch(e=>setError(e.message));
  };

  const createMission = (e) => {
    e.preventDefault();
    const name = document.getElementById('missionName').value.trim();
    if (!name) return;
    fetch('/api/missions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) })
      .then(r=>r.json()).then(()=>{ document.getElementById('missionName').value=''; load(); })
      .catch(()=> setError('Fehler beim Erstellen'));
  };

  const uploadCsv = (e) => {
    e.preventDefault();
    const form = document.getElementById('uploadForm');
    const fd = new FormData(form);
    fetch(`/api/assets/${assetId}/logs/upload`, { method:'POST', body: fd })
      .then(async r => {
        if (!r.ok) { throw new Error(await r.text()); }
        return r.json();
      })
      .then(resp => alert(`Importiert: ${resp.inserted} Zeilen`))
      .catch(err => alert('Fehler beim Import: ' + (err && err.message ? err.message : 'Unbekannt')));
  };

  if (!asset) return h('div', null, 'Lade Asset…');

  return h('div', { className:'vstack gap-3' },
    h('div', { className:'card bg-dark border-secondary' },
      h('div', { className:'card-body' },
        h('div', { className:'d-flex align-items-center' },
          asset.imageUrl ? h('img', { src:asset.imageUrl, style:{height:'64px', width:'64px', objectFit:'cover'}, className:'me-3 rounded' }) : null,
          h('div', null,
            h('h4', { className:'mb-0' }, asset.name),
            h('div', { className:'text-muted' }, asset.category || '-')
          ),
          h('div', { className:'ms-auto' },
            h('button', { className:'btn btn-sm btn-outline-danger', onClick: async ()=>{
              if (!confirm('Asset wirklich löschen? Alle Zuordnungen und Logs werden entfernt.')) return;
              await fetch('/api/assets/' + assetId, { method:'DELETE' });
              location.href = '/assets';
            } }, 'Asset löschen')
          )
        ),
        asset.description ? h('p', { className:'mt-3' }, asset.description) : null
      )
    ),
    error ? h('div', { className:'alert alert-danger' }, error) : null,
    h('div', { className:'row g-3' },
      h('div', { className:'col-12 col-lg-6' },
        h('div', { className:'card bg-dark border-secondary' },
          h('div', { className:'card-body' },
            h('h5', { className:'card-title' }, 'Missionen'),
            h('form', { className:'d-flex gap-2 mb-3', onSubmit:createMission },
              h('input', { id:'missionName', className:'form-control', placeholder:'Neue Mission' }),
              h('button', { className:'btn btn-primary', type:'submit' }, 'Erstellen')
            ),
            missions.length === 0 ? h('div', { className:'text-muted' }, 'Noch keine Missionen') : null,
            missions.map(m => h('div', { key:m.id, className:'form-check mb-1' },
              h('input', { className:'form-check-input', type:'checkbox', id:'m-'+m.id, checked: isAssigned(m.id), onChange:(e)=>toggle(m.id, e.target.checked) }),
              h('label', { className:'form-check-label ms-2', htmlFor:'m-'+m.id }, m.name)
            ))
          )
        )
      ),
      h('div', { className:'col-12 col-lg-6' },
        h('div', { className:'card bg-dark border-secondary' },
          h('div', { className:'card-body' },
            h('h5', { className:'card-title' }, 'CSV Import'),
            h('form', { id:'uploadForm', className:'vstack gap-2', onSubmit:uploadCsv },
              h('select', { name:'missionId', className:'form-select' },
                h('option', { value:'' }, 'ohne Mission'),
                missions.map(m => h('option', { key:m.id, value:m.id }, m.name))
              ),
              h('input', { className:'form-control', type:'file', name:'file', accept:'.csv', required:true }),
              h('button', { className:'btn btn-primary', type:'submit' }, 'Importieren')
            ),
            h('hr'),
            h('div', { className:'d-flex gap-2' },
              h('button', { className:'btn btn-outline-danger', onClick: async ()=>{
                const sel = document.querySelector('#uploadForm select[name="missionId"]').value;
                if (!confirm('Logs wirklich löschen?')) return;
                const url = sel ? `/api/assets/${assetId}/logs?missionId=${encodeURIComponent(sel)}` : `/api/assets/${assetId}/logs`;
                const r = await fetch(url, { method:'DELETE' });
                const resp = await r.json().catch(()=>({}));
                alert('Gelöscht: ' + (resp.deleted ?? '?'));
              } }, 'Logs löschen')
            ),
            h('div', { className:'text-muted small mt-2' }, 'CSV Header erwartet: rpm, steering_deg, distance_m, accel_m_s2, lateral_acc_m_s2, battery_pct, distance_front_m, event_code, manoeuvre, terrain_type, weather_condition, gps_lat, gps_lon, timestamp (optional)')
          )
        )
      )
    )
  );
}

function mount() {
  const root = document.getElementById('root');
  if (!root) return false;
  ReactDOM.createRoot(root).render(React.createElement(AssetDetail));
  return true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  if (!mount()) document.addEventListener('DOMContentLoaded', mount);
}
