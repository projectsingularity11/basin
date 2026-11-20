import { fromUrl } from 'geotiff';
import proj4 from 'proj4';
import { gridBounds, validateElevations } from './grid';
import type { ElevationProvider } from './contracts';

export const copernicusCatalog = 'https://registry.opendata.aws/copernicus-dem/';
export function tileUrl(lon: number, lat: number) {
  const x = Math.floor(lon === 180 ? -180 : lon),
    y = Math.min(89, Math.floor(lat));
  const name = `Copernicus_DSM_COG_10_${y < 0 ? 'S' : 'N'}${String(Math.abs(y)).padStart(2, '0')}_00_${x < 0 ? 'W' : 'E'}${String(Math.abs(x)).padStart(3, '0')}_00_DEM`;
  return `https://copernicus-dem-30m.s3.amazonaws.com/${name}/${name}.tif`;
}

export const copernicus: ElevationProvider = {
  async load(center, side, size, name, signal) {
    if (![24, 32].includes(size) || side / size < 30)
      throw Error(
        'Copernicus screening requires model cells of at least 30 m. Choose a larger region or fewer cells.',
      );
    const grid = gridBounds(...center, side);
    const groups = new Map<string, { index: number; lon: number; lat: number }[]>();
    for (let index = 0; index < size * size; index++) {
      const [longitude, lat] = proj4(grid.projection, 'EPSG:4326', [
        grid.extent[0] + (((index % size) + 0.5) * side) / size,
        grid.extent[3] - ((Math.floor(index / size) + 0.5) * side) / size,
      ]);
      const lon = ((longitude + 540) % 360) - 180;
      const url = tileUrl(lon, lat);
      const group = groups.get(url) ?? [];
      group.push({ index, lon, lat });
      groups.set(url, group);
    }
    if (groups.size > 12)
      throw Error(
        'This region spans too many elevation tiles. Choose a smaller area or move farther from the pole.',
      );
    const elevations = Array<number>(size * size).fill(NaN);
    await Promise.all(
      [...groups].map(async ([url, points]) => {
        const tiff = await fromUrl(url, { allowFullFile: false }, signal);
        try {
          const image = await tiff.getImage();
          const [ox, oy] = image.getOrigin(),
            [dx, dy] = image.getResolution();
          const pixels = points.map((p) => ({
            ...p,
            x: Math.round((p.lon - ox) / dx),
            y: Math.round((p.lat - oy) / dy),
          }));
          const left = Math.max(0, Math.min(...pixels.map((p) => p.x)));
          const top = Math.max(0, Math.min(...pixels.map((p) => p.y)));
          const right = Math.min(image.getWidth(), Math.max(...pixels.map((p) => p.x)) + 1);
          const bottom = Math.min(image.getHeight(), Math.max(...pixels.map((p) => p.y)) + 1);
          const raster = await image.readRasters({
            window: [left, top, right, bottom],
            samples: [0],
            interleave: true,
            signal,
          });
          for (const p of pixels) {
            const value = raster[(p.y - top) * (right - left) + p.x - left];
            if (
              p.x >= left &&
              p.x < right &&
              p.y >= top &&
              p.y < bottom &&
              value !== image.getGDALNoData()
            )
              elevations[p.index] = value;
          }
        } finally {
          await tiff.close();
        }
      }),
    );
    return {
      elevations: validateElevations(elevations, size, null),
      size,
      cellSize: side / size,
      center,
      bounds: grid.bounds,
      projectedBounds: grid.extent,
      crs: `EPSG:${grid.epsg}`,
      name,
      provenance: {
        provider: 'Copernicus',
        dataset: 'Copernicus DEM GLO-30 DSM',
        retrievedAt: new Date().toISOString(),
        sourceUrl: [...groups.keys()][0],
        units: 'm',
        verticalDatum: 'EGM2008 (EPSG:3855)',
        resolution: `Nominal 30 m input spacing, longitude spacing varies with latitude. ${side / size} m output cells.`,
        processing: `Nearest source sample to each projected cell center. Tile sources: ${[...groups.keys()].join(' ')}`,
        license:
          'Contains modified Copernicus DEM data. © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018. Distribution by ESA. Copernicus DEM license.',
        limitations:
          'Digital surface model includes vegetation and buildings. Suitable for regional screening only. Missing or restricted tiles cannot be modeled.',
      },
    };
  },
};
