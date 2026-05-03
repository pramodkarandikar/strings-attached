const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const inputFilePath = path.join(__dirname, '..', 'guitar-chords.xlsx');
const outputFilePath = path.join(__dirname, '..', 'src', 'data', 'chords.json');

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

try {
  console.log('Reading Excel file...');
  const workbook = xlsx.readFile(inputFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  const songs = [];
  let currentId = 1;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    
    const title = row[0].trim();
    const chords = row[1] ? String(row[1]).trim() : "";
    const extra = row[2] ? String(row[2]).trim() : "";
    
    // Parse title and artist if format is "Song (Artist)"
    let songName = title;
    let artist = "Unknown";
    const artistMatch = title.match(/(.+?)\s*\((.+?)\)$/);
    if (artistMatch) {
      songName = artistMatch[1].trim();
      artist = artistMatch[2].trim();
    }
    
    const youtubeId = extractYouTubeId(extra);

    songs.push({
      id: currentId++,
      title: songName,
      artist: artist,
      chords: chords,
      extra: extra,
      youtubeId: youtubeId
    });
  }

  fs.writeFileSync(outputFilePath, JSON.stringify({ songs }, null, 2));
  console.log(`Successfully extracted ${songs.length} songs to chords.json`);
} catch (error) {
  console.error("Error converting excel to json:", error);
  process.exit(1);
}
