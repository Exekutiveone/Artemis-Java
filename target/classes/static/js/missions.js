const h = React.createElement;

function MissionsView() {
  const { useEffect, useState } = React;
  const [missions, setMissions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [error, setError] = useState(null);

  const loadMissions = () => fetch('/api/missions').then(r=>r.json()).then(setMissions);
  const loadAssets = () => fetch('/api/assets').then(r=>r.json()).then(setAssets);
  const loadAssigned = (id) => fetch(`/api/missions/${id}/assets`).then(r=>r.json()).then(setAssignedAssets);

  useEffect(() => { loadMissions(); loadAssets(); }, []);
  useEffect(() => { if (selected) loadAssigned(selected.id); }, [selected]);

  const isAssigned = (assetId) => assignedAssets.some(a => a.id === assetId);

  const toggleAssign = (assetId, checked) => {
    if (!selected) return;
    const url = `/api/missions/${selected.id}/assign` + (checked ? '' : `/${assetId}`);
    const opts = checked ? { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ assetId }) } : { method:'DELETE' };
    fetch(url, opts)
      .then(res=>{ if(!res.ok) throw new Error('Fehler beim Speichern'); })
      .then(()=> loadAssigned(selected.id))
      .catch(e=> setError(e.message));
  };

  const createMission = (e) => {
    e.preventDefault();
    const inp = document.getElementById('newMissionName');
    const name = inp.value.trim(); if (!name) return;
    fetch('/api/missions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) })
      .then(r=>r.json()).then((m)=> { inp.value=''; setSelected(m); loadMissions(); })
      .catch(()=> setError('Fehler beim Erstellen'));
  };

  const uploadCsv = (e) => {
    e.preventDefault(); if (!selected) return;
    const form = document.getElementById('missionUploadForm');
    const fd = new FormData(form);
    const assetId = fd.get('assetId');
    if (!assetId) { alert('Bitte Asset wählen'); return; }
    fd.append('missionId', selected.id);
    fetch(`/api/assets/${assetId}/logs/upload`, { method:'POST', body: fd })
      .then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json(); })
      .then(resp => alert(`Importiert: ${resp.inserted} Zeilen`))
      .catch(err => alert('Fehler beim Import: ' + (err && err.message ? err.message : 'Unbekannt')));
  };

  return h('div', { className:'row g-3' },
    h('div', { className:'col-12 col-lg-4' },
      h('div', { className:'card bg-dark border-secondary' },
        h('div', { className:'card-body' },
          h('h5', { className:'card-title' }, 'Neue Mission'),
          h('form', { className:'d-flex gap-2', onSubmit:createMission },
            h('input', { id:'newMissionName', className:'form-control', placeholder:'Name' }),
            h('button', { className:'btn btn-primary', type:'submit' }, 'Erstellen')
          )
        )
      ),
      h('div', { className:'card bg-dark border-secondary mt-3' },
        h('div', { className:'card-body' },
          h('h5', { className:'card-title' }, 'Missionen'),
          missions.length === 0 ? h('div', { className:'text-muted' }, 'Noch keine Missionen') : null,
          h('div', { className:'row row-cols-1 row-cols-sm-2 g-2' },
            missions.map(m => h('div', { key:m.id, className:'col' },
              h('a', { href:'#', className:'card bg-dark border-secondary card-hover', onClick:(e)=>{ e.preventDefault(); setSelected(m);} },
                h('div', { className:'card-body' },
                  h('div', { className:'h5 mb-1' }, m.name),
                  h('div', { className:'text-muted small' }, `ID: ${m.id}`)
                )
              )
            ))
          )
        )
      )
    ),
    h('div', { className:'col-12 col-lg-8' },
      selected ? h('div', { className:'vstack gap-3' },
        error ? h('div', { className:'alert alert-danger' }, error) : null,
        h('div', { className:'card bg-dark border-secondary' },
          h('div', { className:'card-body' },
            h('h5', { className:'card-title' }, `Zuordnung: ${selected.name}`),
            h('div', { className:'mb-2' },
              h('button', { className:'btn btn-sm btn-outline-danger me-2', onClick: async ()=>{
                if (!confirm('Mission wirklich löschen? Zuordnungen und Missions-ID in Logs werden entfernt/geleert.')) return;
                await fetch(`/api/missions/${selected.id}`, { method:'DELETE' });
                setSelected(null); loadMissions();
              } }, 'Mission löschen'),
              h('button', { className:'btn btn-sm btn-outline-warning', onClick: async ()=>{
                if (!confirm('Alle Logs dieser Mission löschen?')) return;
                const r = await fetch(`/api/missions/${selected.id}/logs`, { method:'DELETE' });
                const resp = await r.json().catch(()=>({}));
                alert('Gelöscht: ' + (resp.deleted ?? '?'));
              } }, 'Missions-Logs löschen')
            ),
            h('div', { className:'row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3' },
              assets.map(a => h('div', { key:a.id, className:'col' },
                h('div', { className:'form-check bg-body-tertiary rounded p-2' },
                  h('input', { className:'form-check-input', type:'checkbox', id:`a-${a.id}`, checked:isAssigned(a.id), onChange:(e)=> toggleAssign(a.id, e.target.checked) }),
                  h('label', { className:'form-check-label ms-2', htmlFor:`a-${a.id}` }, a.name)
                )
              ))
            )
          )
        ),
        h('div', { className:'card bg-dark border-secondary' },
          h('div', { className:'card-body' },
            h('h5', { className:'card-title' }, 'CSV Import in Mission'),
            h('form', { id:'missionUploadForm', className:'row g-2 align-items-center', onSubmit:uploadCsv },
              h('div', { className:'col-12 col-md-5' },
                h('select', { name:'assetId', className:'form-select' },
                  h('option', { value:'' }, 'Asset wählen'),
                  assets.map(a => h('option', { key:a.id, value:a.id }, a.name))
                )
              ),
              h('div', { className:'col-12 col-md-5' },
                h('input', { type:'file', name:'file', className:'form-control', accept:'.csv', required:true })
              ),
              h('div', { className:'col-12 col-md-2' },
                h('button', { className:'btn btn-primary w-100', type:'submit' }, 'Import')
              )
            ),
            h('div', { className:'text-muted small mt-2' }, 'CSV-Header: rpm, steering_deg, distance_m, accel_m_s2, lateral_acc_m_s2, battery_pct, distance_front_m, event_code, manoeuvre, terrain_type, weather_condition, gps_lat, gps_lon, timestamp(optional)')
          )
        )
      ) : h('div', { className:'text-muted' }, 'Wähle links eine Mission')
    )
  );
}

function mountMissions() {
  const root = document.getElementById('root');
  if (!root) return false;
  ReactDOM.createRoot(root).render(React.createElement(MissionsView));
  return true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountMissions);
} else {
  if (!mountMissions()) document.addEventListener('DOMContentLoaded', mountMissions);
}
