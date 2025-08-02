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

    const coordsPLUS = {
        1: { x: 50, y: 155 },  2: { x: 95, y: 155 },  3: { x: 210, y: 155 },
        4: { x: 50, y: 210 },  5: { x: 95, y: 210 },  6: { x: 210, y: 210 },
        7: { x: 50, y: 265 },  8: { x: 95, y: 265 },  9: { x: 210, y: 265 },
        10: { x: 50, y: 320 }, 11: { x: 95, y: 320 }, 12: { x: 210, y: 320 },
        13: { x: 50, y: 375 }, 14: { x: 95, y: 375 }, 15: { x: 210, y: 375 },
        16: { x: 50, y: 430 }, 17: { x: 95, y: 430 }, 18: { x: 210, y: 430 },
        19: { x: 50, y: 485 }, 20: { x: 95, y: 485 }, 21: { x: 210, y: 485 },
        22: { x: 50, y: 540 }, 23: { x: 95, y: 540 }, 24: { x: 210, y: 540 },
        25: { x: 50, y: 595 }, 26: { x: 95, y: 595 }, 27: { x: 210, y: 595 },
        28: { x: 50, y: 650 }, 29: { x: 95, y: 650 }, 30: { x: 210, y: 650 }, 31: { x: 255, y: 650 }
    };

    // =================================================================
    //              COORDENADAS DEL BUS SUITE CORREGIDAS
    // =================================================================
    const coordsSUITE = {
        1: { x: 50, y: 155 },  2: { x: 95, y: 155 },  3: { x: 210, y: 155 },
        4: { x: 50, y: 210 },  5: { x: 95, y: 210 },  6: { x: 210, y: 210 },
        7: { x: 50, y: 265 },  8: { x: 95, y: 265 },  9: { x: 210, y: 265 },
        10: { x: 50, y: 320 }, 11: { x: 95, y: 320 }, 12: { x: 210, y: 320 },
        13: { x: 50, y: 375 }, 14: { x: 95, y: 375 }, 15: { x: 210, y: 375 },
        16: { x: 50, y: 430 }, 17: { x: 95, y: 430 }, 18: { x: 210, y: 430 },
        19: { x: 50, y: 485 }, 20: { x: 95, y: 485 }, 21: { x: 210, y: 485 },
        22: { x: 50, y: 540 }, 23: { x: 95, y: 540 }, 24: { x: 210, y: 540 },
        25: { x: 50, y: 595 }, 26: { x: 95, y: 595 }
    };

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
