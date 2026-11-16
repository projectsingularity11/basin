/** Future adapters must explicitly establish compatible units and reference frames. No real dataset is ingested in v0.1. */
export interface DatasetProvenance {
  name: string;
  provider: string;
  retrievedAt: string;
  units: string;
  coordinateReferenceSystem: string | null;
  horizontalResolutionMeters: number | null;
  verticalDatum: string | null;
  license: string;
  processing: string[];
  limitations: string[];
  sourceUrl: string;
}
export interface ElevationDataset {
  provenance: DatasetProvenance;
  width: number;
  height: number;
  elevationsMeters: Float64Array;
  noData: number | null;
}
export interface ElevationAdapter {
  read(input: ArrayBuffer, metadata: DatasetProvenance): Promise<ElevationDataset>;
}
