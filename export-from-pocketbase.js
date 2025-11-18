const PocketBase = require('pocketbase/cjs');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

// Create directories for data and images
const dataDir = path.join(__dirname, 'data');
const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Helper function to download files
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Helper function to process records with images
async function processRecordsWithImages(records, collection, imageField) {
  const processedRecords = [];

  for (const record of records) {
    const processedRecord = { ...record };

    if (record[imageField]) {
      const imageUrl = pb.getFileUrl(record, record[imageField]);
      const imageFilename = `${collection}_${record.id}_${record[imageField]}`;
      const imagePath = path.join(imagesDir, imageFilename);

      try {
        console.log(`Downloading ${imageUrl} to ${imagePath}`);
        await downloadFile(imageUrl, imagePath);
        processedRecord[`${imageField}_local`] = `images/${imageFilename}`;
        console.log(`✓ Downloaded ${imageFilename}`);
      } catch (error) {
        console.error(`✗ Failed to download ${imageFilename}:`, error.message);
      }
    }

    processedRecords.push(processedRecord);
  }

  return processedRecords;
}

async function exportData() {
  try {
    console.log('Starting PocketBase data export...\n');

    // Fetch all collections
    console.log('Fetching forum_info...');
    const forumInfo = await pb.collection('forum_info').getFullList();
    console.log(`✓ Fetched ${forumInfo.length} forum_info records`);

    console.log('Fetching forum_organizer...');
    const forumOrganizer = await pb.collection('forum_organizer').getFullList();
    console.log(`✓ Fetched ${forumOrganizer.length} forum_organizer records`);

    console.log('Fetching forum_schedule...');
    const forumSchedule = await pb.collection('forum_schedule').getFullList({ sort: 'start_time' });
    console.log(`✓ Fetched ${forumSchedule.length} forum_schedule records`);

    console.log('Fetching forum_speakers...');
    const forumSpeakers = await pb.collection('forum_speakers').getFullList();
    console.log(`✓ Fetched ${forumSpeakers.length} forum_speakers records\n`);

    // Process records with images
    console.log('Processing images...\n');

    console.log('Processing forum_info images...');
    const processedForumInfo = await processRecordsWithImages(forumInfo, 'forum_info', 'img');

    console.log('\nProcessing forum_organizer images...');
    const processedForumOrganizer = await processRecordsWithImages(forumOrganizer, 'forum_organizer', 'img');

    console.log('\nProcessing forum_speakers images...');
    const processedForumSpeakers = await processRecordsWithImages(forumSpeakers, 'forum_speakers', 'picture');

    // Save JSON files
    console.log('\nSaving JSON files...');

    fs.writeFileSync(
      path.join(dataDir, 'forum_info.json'),
      JSON.stringify(processedForumInfo, null, 2)
    );
    console.log('✓ Saved data/forum_info.json');

    fs.writeFileSync(
      path.join(dataDir, 'forum_organizer.json'),
      JSON.stringify(processedForumOrganizer, null, 2)
    );
    console.log('✓ Saved data/forum_organizer.json');

    fs.writeFileSync(
      path.join(dataDir, 'forum_schedule.json'),
      JSON.stringify(forumSchedule, null, 2)
    );
    console.log('✓ Saved data/forum_schedule.json');

    fs.writeFileSync(
      path.join(dataDir, 'forum_speakers.json'),
      JSON.stringify(processedForumSpeakers, null, 2)
    );
    console.log('✓ Saved data/forum_speakers.json');

    console.log('\n✓ Export completed successfully!');
    console.log(`\nExported data:`);
    console.log(`  - ${forumInfo.length} forum info records`);
    console.log(`  - ${forumOrganizer.length} organizer records`);
    console.log(`  - ${forumSchedule.length} schedule records`);
    console.log(`  - ${forumSpeakers.length} speaker records`);

  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  }
}

exportData();
