const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

// CONFIGURATION
const CLOUDFLARE_ACCOUNT_ID = '76f7cbebac1ccd97579e8d7820e915ac';
const CLOUDFLARE_ACCOUNT_HASH = 'JVmYbduioNVkRm0SvNGcew';

// Using Global API Key (more reliable than API Token)
const CLOUDFLARE_API_KEY = 'aa88595e1f123df473f54169c78b235f4e1de';
const CLOUDFLARE_EMAIL = 'Tzuchidigital@gmail.com';

const IMAGES_DIR = './assets/img';
const OUTPUT_JSON = './cloudflare-image-urls.json';

// Read all speaker data
const speakersData = JSON.parse(fs.readFileSync('./data/forum_speakers.json', 'utf8'));

// Function to upload a single image to Cloudflare
async function uploadImageToCloudflare(filePath, imageId) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('id', imageId); // Use custom ID for easier management

        const options = {
            method: 'POST',
            hostname: 'api.cloudflare.com',
            path: `/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
            headers: {
                'X-Auth-Email': CLOUDFLARE_EMAIL,
                'X-Auth-Key': CLOUDFLARE_API_KEY,
                ...form.getHeaders()
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.success) {
                        resolve(result.result);
                    } else {
                        reject(new Error(`Upload failed: ${JSON.stringify(result.errors)}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        form.pipe(req);
    });
}

// Main upload function
async function uploadAllImages() {
    console.log('🚀 Starting upload to Cloudflare Images...\n');

    const results = [];

    for (let i = 0; i < speakersData.length; i++) {
        const speaker = speakersData[i];
        const localPath = speaker.picture;
        const fileName = path.basename(localPath);
        const fullPath = path.join(process.cwd(), localPath);

        // Create a clean ID from filename (remove .png extension)
        const imageId = fileName.replace('.png', '').toLowerCase().replace(/\s+/g, '-');

        console.log(`📤 [${i + 1}/${speakersData.length}] Uploading: ${fileName}`);

        try {
            if (!fs.existsSync(fullPath)) {
                console.log(`   ⚠️  File not found: ${fullPath}`);
                results.push({
                    name: speaker.name,
                    fileName: fileName,
                    status: 'error',
                    error: 'File not found'
                });
                continue;
            }

            const result = await uploadImageToCloudflare(fullPath, imageId);

            // Cloudflare Images URL format: https://imagedelivery.net/{account_hash}/{image_id}/{variant}
            const deliveryUrl = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${result.id}/public`;

            console.log(`   ✅ Success! ID: ${result.id}`);
            console.log(`   🔗 URL: ${deliveryUrl}\n`);

            results.push({
                name: speaker.name,
                fileName: fileName,
                imageId: result.id,
                url: deliveryUrl, // Cloudflare Images delivery URL
                variantUrl: result.variants[0], // Alternative variant URL
                status: 'success'
            });

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
            results.push({
                name: speaker.name,
                fileName: fileName,
                status: 'error',
                error: error.message
            });
        }
    }

    // Save results
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));
    console.log(`\n✅ Upload complete! Results saved to ${OUTPUT_JSON}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Total: ${results.length}`);
    console.log(`   Success: ${results.filter(r => r.status === 'success').length}`);
    console.log(`   Errors: ${results.filter(r => r.status === 'error').length}`);
}

// Configuration is already set, no need to check

// Run upload
uploadAllImages().catch(console.error);
