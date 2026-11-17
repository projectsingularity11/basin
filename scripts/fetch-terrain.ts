import { usgs } from '../src/lib/geo/usgs';
import { writeFileSync } from 'node:fs';
async function main() {
  const data = await usgs.load([-95.4187924, 30.0795707], 480, 24, 'Spring, Texas');
  writeFileSync('tests/fixtures/spring-usgs.json', JSON.stringify(data, null, 2));
  console.log({
    min: Math.min(...data.elevations),
    max: Math.max(...data.elevations),
    cells: data.elevations.length,
    crs: data.crs,
    source: data.provenance.sourceUrl,
  });
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
