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

    // =================================================================
    //               COORDENADAS Y ESCALA CORREGIDAS
    // =================================================================

    const escalaPlus = 68;
    const escalaSuite = 75;

    const coordsPLUS = {
        1: { x: 50, y: 120 },  2: { x: 98, y: 120 },  3: { x: 205, y: 120 },
        4: { x: 50, y: 170 },  5: { x: 98, y: 170 },  6: { x: 205, y: 170 },
        7: { x: 50, y: 220 },  8: { x: 98, y: 220 },  9: { x: 205, y: 220 },
        10: { x: 50, y: 270 }, 11: { x: 98, y: 270 }, 12: { x: 205, y: 270 },
        13: { x: 50, y: 320 }, 14: { x: 98, y: 320 }, 15: { x: 205, y: 320 },
        16: { x: 50, y: 370 }, 17: { x: 98, y: 370 }, 18: { x: 205, y: 370 },
        19: { x: 50, y: 420 }, 20: { x: 98, y: 420 }, 21: { x: 205, y: 420 },
        22: { x: 50, y: 470 }, 23: { x: 98, y: 470 }, 24: { x: 205, y: 470 },
        25: { x: 50, y: 520 }, 26: { x: 98, y: 520 }, 27: { x: 205, y: 520 },
        28: { x: 50, y: 570 }, 29: { x: 98, y: 570 }, 30: { x: 205, y: 570 }, 31: { x: 253, y: 570 }
    };
    
    const coordsSUITE = {
        1: { x: 45, y: 120 },  2: { x: 105, y: 120 }, 3: { x: 200, y: 120 },
        4: { x: 45, y: 175 },  5: { x: 105, y: 175 }, 6: { x: 200, y: 175 },
        7: { x: 45, y: 230 },  8: { x: 105, y: 230 }, 9: { x: 200, y: 230 },
        10: { x: 45, y: 285 }, 11: { x: 105, y: 285 }, 12: { x: 200, y: 285 },
        13: { x: 45, y: 340 }, 14: { x: 105, y: 340 }, 15: { x: 200, y: 340 },
        16: { x: 45, y: 395 }, 17: { x: 105, y: 395 }, 18: { x: 200, y: 395 },
        19: { x: 45, y: 450 }, 20: { x: 105, y: 450 }, 21: { x: 200, y: 450 },
        22: { x: 45, y: 505 }, 23: { x: 105, y: 505 }, 24: { x: 200, y: 505 },
        25: { x: 45, y: 560 }, 26: { x: 105, y: 560 }
    };

    const isPlus = busInfo.CategoriaServicio === 'PLUS';
    const coords = isPlus ? coordsPLUS : coordsSUITE;
    const escala = isPlus ? escalaPlus : escalaSuite;

    let composites = [];
    for (const seat of allSeats) {
      const n = seat.NroAsiento;
      const pos = coords[n];
      if (!pos) continue;

      const estado = mapOcup[n] ?? 0;
      const sprPath = path.join(basePath, `${txtEstado[estado]}_${String(n).padStart(2, '0')}.png`);
      
      if (fs.existsSync(sprPath)) {
        const spriteBuffer = await sharp(sprPath)
          .resize({ width: escala }) // <-- Escalado dinámico
          .toBuffer();

        composites.push({
          input: spriteBuffer,
          left: pos.x,
          top: pos.y
        });
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
