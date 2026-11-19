export type RainSeries = { source: string; stepMinutes: number; rates: number[] };
export function validateRainSeries(value: unknown): RainSeries {
  if (!value || typeof value !== 'object') throw Error('Invalid rainfall series.');
  const series = value as RainSeries;
  if (
    typeof series.source !== 'string' ||
    !series.source.trim() ||
    series.source.length > 500 ||
    !Number.isInteger(series.stepMinutes) ||
    series.stepMinutes < 1 ||
    !Array.isArray(series.rates) ||
    series.rates.length < 1 ||
    series.rates.length * series.stepMinutes > 120 ||
    series.rates.some(
      (rate) => typeof rate !== 'number' || !Number.isFinite(rate) || rate < 0 || rate > 200,
    )
  )
    throw Error(
      'Rainfall requires a source, regular whole-minute intervals, at most 120 minutes, and rates from 0 to 200 mm/h.',
    );
  return {
    source: series.source.trim(),
    stepMinutes: series.stepMinutes,
    rates: [...series.rates],
  };
}

export function parseRainCsv(csv: string, source: string): RainSeries {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  if (header.replace(/^\uFEFF/, '').trim() !== 'minute,rate_mm_h')
    throw Error('CSV header must be minute,rate_mm_h.');
  if (lines.length < 2 || lines.length > 120) throw Error('Include 2 to 120 rainfall intervals.');
  const rows = lines.map((line) => line.split(',').map((field) => field.trim()));
  if (
    rows.some(
      (row) =>
        row.length !== 2 || row.some((field) => field === '' || !Number.isFinite(Number(field))),
    )
  )
    throw Error('Each CSV row must contain a minute and a numeric rate.');
  const stepMinutes = Number(rows[1][0]);
  if (rows.some((row, i) => Number(row[0]) !== i * stepMinutes))
    throw Error('Start at minute 0 and use equal intervals.');
  return validateRainSeries({ source, stepMinutes, rates: rows.map((row) => Number(row[1])) });
}
