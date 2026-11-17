import { fromArrayBuffer } from 'geotiff';
import { gridBounds, validateElevations } from './grid';
import type { ElevationProvider, GeographicTerrain } from './contracts';
export const USGS_URL =
  'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer';
export const usgs: ElevationProvider = {
  async load(center, side, size, name, signal) {
    if (![24, 32].includes(size)) throw Error('Grid resolution must be 24 or 32 cells per side.');
    const g = gridBounds(...center, side);
    const query = new URLSearchParams({
      bbox: g.extent.join(','),
      bboxSR: String(g.epsg),
      imageSR: String(g.epsg),
      size: `${size},${size}`,
      format: 'tiff',
      pixelType: 'F32',
      interpolation: 'RSP_BilinearInterpolation',
      renderingRule: JSON.stringify({ rasterFunction: 'None' }),
      f: 'image',
    });
    const sourceUrl = USGS_URL + '/exportImage?' + query;
    const response = await fetch(sourceUrl, {
      signal: signal ?? AbortSignal.timeout(25000),
      next: { revalidate: 86400 },
    });
    if (!response.ok)
      throw Error(
        `USGS elevation service returned ${response.status}. Retry or select a smaller region.`,
      );
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > 2000000) throw Error('Elevation response exceeded the safety limit.');
    let elevations: number[];
    try {
      const tiff = await fromArrayBuffer(buffer),
        image = await tiff.getImage();
      if (image.getWidth() !== size || image.getHeight() !== size)
        throw Error('Unexpected raster extent');
      const values = await image.readRasters({ samples: [0], interleave: true });
      elevations = validateElevations(values, size, image.getGDALNoData());
    } catch (e) {
      throw Error('USGS did not return a valid elevation raster. ' + (e as Error).message);
    }
    return {
      elevations,
      size,
      cellSize: side / size,
      center,
      bounds: g.bounds,
      projectedBounds: g.extent,
      crs: `EPSG:${g.epsg}`,
      name,
      provenance: {
        provider: 'USGS',
        dataset: '3DEP Bare Earth DEM dynamic service',
        retrievedAt: new Date().toISOString(),
        sourceUrl,
        units: 'm',
        verticalDatum:
          'NAVD88 for contiguous U.S. source DEMs; verify local source metadata before engineering use.',
        resolution: `${side / size} m output sampling; native source resolution varies.`,
        processing:
          'USGS bilinear resampling into a WGS84 UTM square; north-to-south row order. No fabricated or filled missing cells.',
        license: 'USGS public-domain data; acknowledge USGS 3DEP.',
        limitations:
          'Current elevation is not historical Harvey terrain. Output spacing is not survey accuracy. Buildings, drainage pipes and historical infrastructure are not represented.',
      },
    } satisfies GeographicTerrain;
  },
};
