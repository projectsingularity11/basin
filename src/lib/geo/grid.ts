import proj4 from 'proj4';
export function gridBounds(lon: number, lat: number, side: number) {
  if (
    !Number.isFinite(lon) ||
    !Number.isFinite(lat) ||
    lon < -125 ||
    lon > -66 ||
    lat < 24 ||
    lat > 50
  )
    throw Error('Elevation selection is currently limited to the contiguous United States.');
  if (![240, 480, 960].includes(side)) throw Error('Select a 240, 480, or 960 meter region.');
  const zone = Math.floor((lon + 180) / 6) + 1,
    epsg = 32600 + zone,
    projection = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;
  const [x, y] = proj4('EPSG:4326', projection, [lon, lat]);
  const extent: [number, number, number, number] = [
    x - side / 2,
    y - side / 2,
    x + side / 2,
    y + side / 2,
  ];
  const corners = [
    [extent[0], extent[1]],
    [extent[2], extent[1]],
    [extent[2], extent[3]],
    [extent[0], extent[3]],
  ].map((p) => proj4(projection, 'EPSG:4326', p));
  const polygon = [...corners, corners[0]];
  return {
    epsg,
    projection,
    extent,
    polygon,
    bounds: [
      Math.min(...corners.map((p) => p[0])),
      Math.min(...corners.map((p) => p[1])),
      Math.max(...corners.map((p) => p[0])),
      Math.max(...corners.map((p) => p[1])),
    ] as [number, number, number, number],
  };
}
export function validateElevations(values: ArrayLike<number>, size: number, noData: number | null) {
  if (values.length !== size * size)
    throw Error('Elevation raster dimensions do not match the requested grid.');
  const data = Array.from(values);
  if (data.some((v) => !Number.isFinite(v) || v === noData || v < -500 || v > 9000))
    throw Error('The elevation provider returned missing or invalid cells. Choose another region.');
  return data;
}
