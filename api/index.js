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
    //         COORDENADAS Y ESCALAS FINALES PROPORCIONADAS
    // =================================================================
    const escalaPlus = 50;
    const escalaSuite = 55;

    const coordsPLUS = {
      "1": { "x": 35, "y": 130 }, "2": { "x": 97, "y": 130 }, "3": { "x": 220, "y": 130 },
      "4": { "x": 35, "y": 186 }, "5": { "x": 97, "y": 186 }, "6": { "x": 220, "y": 186 },
      "7": { "x": 35, "y": 241 }, "8": { "x": 97, "y": 241 }, "9": { "x": 220, "y": 241 },
      "10": { "x": 35, "y": 297 }, "11": { "x": 97, "y": 297 }, "12": { "x": 220, "y": 297 },
      "13": { "x": 35, "y": 352 }, "14": { "x": 97, "y": 352 }, "15": { "x": 220, "y": 352 },
      "16": { "x": 35, "y": 408 }, "17": { "x": 97, "y": 408 }, "18": { "x": 220, "y": 408 },
      "19": { "x": 35, "y": 463 }, "20": { "x": 97, "y": 463 }, "21": { "x": 220, "y": 463 },
      "22": { "x": 35, "y": 519 }, "23": { "x": 97, "y": 519 }, "24": { "x": 220, "y": 519 },
      "25": { "x": 35, "y": 574 }, "26": { "x": 97, "y": 574 }, "27": { "x": 220, "y": 574 },
      "28": { "x": 35, "y": 630 }, "29": { "x": 97, "y": 630 }, "30": { "x": 158, "y": 630 }, "31": { "x": 220, "y": 630 }
    };
    
    const coordsSUITE = {
      "1": { "x": 35, "y": 135 }, "2": { "x": 95, "y": 135 }, "3": { "x": 210, "y": 135 },
      "4": { "x": 35, "y": 195 }, "5": { "x": 95, "y": 195 }, "6": { "x": 210, "y": 195 },
      "7": { "x": 35, "y": 256 }, "8": { "x": 95, "y": 256 }, "9": { "x": 210, "y": 256 },
      "10": { "x": 35, "y": 316 }, "11": { "x": 95, "y": 316 }, "12": { "x": 210, "y": 316 },
      "13": { "x": 35, "y": 377 }, "14": { "x": 95, "y": 377 }, "15": { "x": 210, "y": 377 },
      "16": { "x": 35, "y": 438 }, "17": { "x": 95, "y": 438 }, "18": { "x": 210, "y": 438 },
      "19": { "x": 35, "y": 498 }, "20": { "x": 95, "y": 498 }, "21": { "x": 210, "y": 498 },
      "22": { "x": 35, "y": 559 }, "23": { "x": 95, "y": 559 }, "24": { "x": 210, "y": 559 },
      "25": { "x": 35, "y": 620 }, "26": { "x": 95, "y": 620 }
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
          .resize({ width: escala })
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
