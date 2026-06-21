import fs from 'fs';
import path from 'path';

const ayatsDir = path.join(__dirname, 'src/data/ayats/single');
const outputFile = path.join(__dirname, 'src/data/ayats.jsonl');

const files = fs.readdirSync(ayatsDir).filter(f => f.endsWith('.json'));

const ayats = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(ayatsDir, file), 'utf8');
  const data = JSON.parse(content);
  ayats.push(data);
}

// Sort by id just to be sure
ayats.sort((a, b) => a.id - b.id);

const outStream = fs.createWriteStream(outputFile);
for (const a of ayats) {
  // Vector format: [id, ayah, grand_east, grand_west, small_east, small_west, nafsy]
  const vector = [a.id, a.ayah, a.grand_east, a.grand_west, a.small_east, a.small_west, a.nafsy];
  outStream.write(JSON.stringify(vector) + '\n');
}
outStream.end();
console.log('Done generating ayats.jsonl');
