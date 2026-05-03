import * as xlsx from 'xlsx';

export function exportCustomSongsToExcel(songs) {
  if (!songs || songs.length === 0) {
    alert("No custom songs to export.");
    return;
  }

  // Format data for Excel
  const data = [
    ["Title", "Chords", "Notes"] // Headers based on existing format
  ];

  songs.forEach(song => {
    // Reconstruct title as "Title (Artist)" if artist exists
    const titleWithArtist = (song.artist && song.artist !== "Unknown") 
      ? `${song.title} (${song.artist})` 
      : song.title;
      
    // Reconstruct extra field, include youtube link if exists
    let notes = song.extra || "";
    if (song.youtubeId) {
      const ytLink = `https://youtube.com/watch?v=${song.youtubeId}`;
      notes = notes ? `${notes} - ${ytLink}` : ytLink;
    }

    data.push([
      titleWithArtist,
      song.chords || "",
      notes
    ]);
  });

  const worksheet = xlsx.utils.aoa_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Custom Chords");

  // Trigger download
  xlsx.writeFile(workbook, "custom-chords.xlsx");
}
