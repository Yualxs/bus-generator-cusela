const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

export default async function handler(req, res) {
  try {
    const { allSeats, busInfo } = req.body;

    const mapOcup = {};
    for (const s of allSeats) {
      if (s.IdEstadoReserva || s.IdEstadoReserva > 0) {
        mapOcup[s.NroAsiento] = s.IdEstadoReserva;
      }
    }
    const txtEstado = ['disponible', 'reservado', 'ocupado'];
    const basePath = path.join(process.cwd(), 'sprites');
    const fileTpl = busInfo.CategoriaServicio === 'PLUS' 
      ? 'bus_plus_plantilla.png' 
      : 'bus_suite_plantilla.png';

    const coordsPLUS = { 1:{x:50,y:155}, 2:{x:95,y:155}, 3:{x:210,y:155}, 4:{x:255,y:155}, 5:{x:50,y:210}, 6:{x:95,y:210}, 7:{x:210,y:210}, 8:{x:255,y:210}, 9:{x:50,y:265}, 10:{x:95,y:265}, 11:{x:210,y:265}, 12:{x:255,y:265}, 13:{x:50,y:320}, 14:{x:95,y:320}, 15:{x:210,y:320}, 16:{x:255,y:320}, 17:{x:50,y:375}, 18:{x:95,y:375}, 19:{x:210,y:375}, 20:{x:255,y:375}, 21:{x:50,y:430}, 22:{x:95,y:430}, 23:{x:210,y:430}, 24:{x:255,y:430}, 25:{x:50,y:485}, 26:{x:95,y:485}, 27:{x:210,y:485}, 28:{x:255,y:485}, 29:{x:50,y:540}, 30:{x:95,y:540}, 31:{x:210,y:540} };
    const coordsSUITE = { 1:{x:50,y:155}, 2:{x:95,y:155}, 3:{x:210,y:155}, 4:{x:255,y:155}, 5:{x:50,y:210}, 6:{x:95,y:210}, 7:{x:210,y:210}, 8:{x:255,y:210}, 9:{x:50,y:265}, 10:{x:95,y:265}, 11:{x:210,y:265}, 12:{x:255,y:265}, 13:{x:50,y:320}, 14:{x:95,y:320}, 15:{x:210,y:320}, 16:{x:255,y:320}, 17:{x:50,y:375}, 18:{x:95,y:375}, 19:{x:210,y:375}, 20:{x:255,y:375}, 21:{x:50,y:430}, 22:{x:95,y:430}, 23:{x:210,y:430}, 24:{x:255,y:430}, 25:{x:210,y:485}, 26:{x:255,y:485} };
    const coords = busInfo.CategoriaServicio === 'PLUS' ? coordsPLUS : coordsSUITE;

    let composites = [];
    for (const seat of allSeats) {
      const n = seat.NroAsiento;
      const pos = coords[n];
      if (!pos) continue;

      const estado = mapOcup[n] ?? 0;
      const sprPath = path.join(basePath, `${txtEstado[estado]}_${String(n).padStart(2, '0')}.png`);

      if (fs.existsSync(sprPath)) {
        composites.push({ input: sprPath, left: pos.x, top: pos.y });
      }
    }

    const bufferFinal = await sharp(path.join(basePath, fileTpl))
      .composite(composites)
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(bufferFinal);

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to generate image', details: error.message });
  }
}
