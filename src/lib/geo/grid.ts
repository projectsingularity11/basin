import proj4 from 'proj4';
export function gridBounds(lon: number, lat: number, side: number) {
  if (
    !Number.isFinite(lon) ||
    !Number.isFinite(lat) ||
    lon < -180 ||
    lon > 180 ||
    lat < -90 ||
    lat > 90
  )
    throw Error('Enter latitude from −90 to 90 and longitude from −180 to 180.');
  if (![240, 480, 960, 1920, 3840].includes(side)) throw Error('Unsupported region width.');
  const zone = Math.min(60, Math.floor((lon + 180) / 6) + 1);
  const polar = lat < -80 || lat > 84;
  const epsg = (lat < 0 ? 32700 : 32600) + (polar ? 61 : zone);
  const projection = polar
    ? `+proj=stere +lat_0=${lat < 0 ? -90 : 90} +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs`
    : `+proj=utm +zone=${zone} ${lat < 0 ? '+south' : ''} +datum=WGS84 +units=m +no_defs`;
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
