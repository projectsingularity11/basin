export type Place = { name: string; longitude: number; latitude: number };
export type GeographicTerrain = {
  elevations: number[];
  size: number;
  cellSize: number;
  center: [number, number];
  bounds: [number, number, number, number];
  projectedBounds: [number, number, number, number];
  crs: string;
  name: string;
  provenance: {
    provider: string;
    dataset: string;
    retrievedAt: string;
    sourceUrl: string;
    units: 'm';
    verticalDatum: string;
    resolution: string;
    processing: string;
    license: string;
    limitations: string;
  };
};
export type ApiError = { error: { code: string; message: string } };
export interface ElevationProvider {
  load(
    center: [number, number],
    side: number,
    size: number,
    name: string,
    signal?: AbortSignal,
  ): Promise<GeographicTerrain>;
}
