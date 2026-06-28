// ---------------------------------------------------------
// Comanda — estado compartido en localStorage (datos demo)
// ---------------------------------------------------------
const DB_KEY = 'comanda_db_v1';

function seedDB(){
  return {
    locales: [
      { id:'L1', nombre:'Local Miraflores' },
      { id:'L2', nombre:'Local San Isidro' },
      { id:'L3', nombre:'Local La Molina' },
    ],
    mesas: [
      { id:'M1', localId:'L1', numero:1 }, { id:'M2', localId:'L1', numero:2 },
      { id:'M3', localId:'L1', numero:3 }, { id:'M4', localId:'L1', numero:4 },
      { id:'M5', localId:'L2', numero:1 }, { id:'M6', localId:'L2', numero:2 },
      { id:'M7', localId:'L2', numero:3 },
      { id:'M8', localId:'L3', numero:1 }, { id:'M9', localId:'L3', numero:2 },
    ],
    categorias: ['Entradas','Fondos','Bebidas','Postres'],
    productos: [
      { id:'P1', nombre:'Causa de Pollo', categoria:'Entradas', precio:22, desc:'Papa amarilla, ají amarillo, pollo deshilachado, palta.', stockPorLocal:{L1:[1,1,1,1,1,1,1],L2:[1,1,1,1,1,1,1],L3:[1,1,1,0,1,1,1]} },
      { id:'P2', nombre:'Tequeños de Queso', categoria:'Entradas', precio:18, desc:'8 unidades, salsa de guacamole.', stockPorLocal:{L1:[1,1,1,1,1,1,1],L2:[1,1,0,1,1,1,1],L3:[1,1,1,1,1,1,1]} },
      { id:'P3', nombre:'Lomo Saltado', categoria:'Fondos', precio:38, desc:'Lomo fino salteado, papas fritas, arroz.', stockPorLocal:{L1:[1,1,1,1,1,1,1],L2:[1,1,1,1,1,1,1],L3:[1,1,1,1,1,1,1]} },
      { id:'P4', nombre:'Ají de Gallina', categoria:'Fondos', precio:32, desc:'Gallina deshilachada en crema de ají amarillo.', stockPorLocal:{L1:[1,1,1,1,0,1,1],L2:[1,1,1,1,1,1,1],L3:[1,1,1,1,1,1,1]} },
      { id:'P5', nombre:'Ceviche Mixto', categoria:'Fondos', precio:42, desc:'Pescado y mariscos, leche de tigre, camote, choclo.', stockPorLocal:{L1:[1,1,1,1,1,1,0],L2:[1,1,1,1,1,1,1],L3:[0,1,1,1,1,1,1]} },
      { id:'P6', nombre:'Chicha Morada', categoria:'Bebidas', precio:9, desc:'Jarra 1L, maíz morado, piña, canela.', stockPorLocal:{L1:[1,1,1,1,1,1,1],L2:[1,1,1,1,1,1,1],L3:[1,1,1,1,1,1,1]} },
      { id:'P7', nombre:'Limonada Frozen', categoria:'Bebidas', precio:11, desc:'Limón, hierbabuena, hielo frappe.', stockPorLocal:{L1:[1,1,1,1,1,1,1],L2:[0,1,1,1,1,1,1],L3:[1,1,1,1,1,1,1]} },
      { id:'P8', nombre:'Suspiro a la Limeña', categoria:'Postres', precio:16, desc:'Manjar blanco, merengue al oporto.', stockPorLocal:{L1:[1,1,1,1,1,1,1],L2:[1,1,1,1,1,1,1],L3:[1,1,1,1,1,1,1]} },
    ],
    pedidos: [
      { id:'ORD-1042', localId:'L1', origen:'local', mesaId:'M2', items:[{prodId:'P3',cant:2,nota:'Uno sin cebolla'},{prodId:'P6',cant:1,nota:''}], estado:'nuevo', hora: Date.now()-2*60000 },
      { id:'ORD-1043', localId:'L1', origen:'online', cliente:'Rosa Medina', items:[{prodId:'P5',cant:1,nota:'Extra limón'},{prodId:'P8',cant:1,nota:''}], estado:'preparando', hora: Date.now()-9*60000 },
      { id:'ORD-1044', localId:'L1', origen:'llevar', cliente:'Jorge Paredes', items:[{prodId:'P1',cant:1,nota:''}], estado:'nuevo', hora: Date.now()-1*60000 },
      { id:'ORD-1045', localId:'L1', origen:'local', mesaId:'M1', items:[{prodId:'P4',cant:1,nota:'Sin ají, picante aparte'},{prodId:'P7',cant:2,nota:''}], estado:'listo', hora: Date.now()-18*60000 },
    ],
  };
}

function loadDB(){
  const raw = localStorage.getItem(DB_KEY);
  if(!raw){
    const db = seedDB();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
  try{ return JSON.parse(raw); }catch(e){ const db = seedDB(); localStorage.setItem(DB_KEY, JSON.stringify(db)); return db; }
}

function saveDB(db){
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDB(){
  const db = seedDB();
  saveDB(db);
  return db;
}

function genOrderId(db){
  const nums = db.pedidos.map(p=>parseInt(p.id.split('-')[1]||0));
  const next = (nums.length? Math.max(...nums):1000)+1;
  return 'ORD-'+next;
}

function fmtHoraRelativa(ts){
  const min = Math.max(0, Math.round((Date.now()-ts)/60000));
  if(min<1) return 'ahora';
  if(min===1) return 'hace 1 min';
  return 'hace '+min+' min';
}

const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
