const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'guitar-chords.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Use sheet_to_json to get array of arrays
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

const chordMappings = {
  "Tu bole (Jaane tu ya jaane na)": "C G Am F",
  "More than words": "G Cadd9 Am7 C D Em",
  "Mast magan (Two States)": "G C D Em Am",
  "Fitoor": "E C#m A B",
  "Paani da rang": "Em D C Am",
  "Ye tumhari meri baatein": "D G Bm A",
  "Na tum jano na hum (Kaho na pyaar hai)": "A C#m D E Bm",
  "Kalank": "C F Am G Em",
  "Baadal me paon hai (Chak De India)": "E A B C#m",
  "Khuda jane kya (Bachna Ae Haseeno)": "Em C D G",
  "Rihaa (Arijit Singh)": "Dm7 Fmaj7 Bbmaj7 Bbsus2 Csus2",
  "Kasoor (Prateek Kuhad)": "E C#m A B",
  "In dino": "G D Em C",
  "Baatein kuchh ankahee": "C Am F G",
  "Maeri (Palash Sen)": "E D A C#m",
  "Where's the party tonight (KANK)": "Am G F E",
  "One Love (Blue)": "Am G F",
  "Tu ashiqui hai (Jhankaar Beats)": "G Em C D",
  "APT (Rosé, Bruno Mars)": "Dm G C Am",
  "Moh moh ke dhaage": "D G A Bm",
  "Attention Acoustic (Charlie Puth)": "Ebm Db B Bb",
  "Kitni der tak": "G D Em C"
};

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  
  const title = row[0];
  let chords = row[1] ? String(row[1]) : "";
  let extra = row[2] ? String(row[2]) : "";

  if (chords.toLowerCase().includes("todo") || extra.toLowerCase().includes("todo")) {
    if (chordMappings[title]) {
      // replace TODO in chords if it's there
      if (chords.toLowerCase() === "todo") {
         data[i][1] = chordMappings[title];
      } else if (chords.toLowerCase().includes("todo")) {
         data[i][1] = chords.replace(/todo/i, chordMappings[title]);
      } else if (extra.toLowerCase().includes("todo")) {
         // if chords is fine but extra has TODO, we can just replace it in extra
         data[i][2] = extra.replace(/todo/i, "Chords updated");
      }
    }
  }
}

// Convert back to sheet
const newWorksheet = xlsx.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;

xlsx.writeFile(workbook, filePath);
console.log("Excel file updated successfully!");
