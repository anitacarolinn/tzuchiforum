# Tzu Chi Forum - Static JSON Version

This project has been converted from a PocketBase database-backed application to a static JSON-based site.

## Directory Structure

```
.
├── data/                       # JSON data files
│   ├── forum_info.json        # Forum metadata
│   ├── forum_organizer.json   # Organizers data
│   ├── forum_schedule.json    # Event schedule
│   └── forum_speakers.json    # Speaker profiles
├── images/                     # All downloaded images
├── assets/                     # Static assets
├── index.html                  # Main HTML file
├── script.js                   # Main JavaScript (now reads from JSON)
└── export-from-pocketbase.js  # Export script (for future updates)

## Data Files

### forum_info.json
Contains forum general information:
- title, theme, quote
- dates, country, locations
- description
- img_local (path to background image)

### forum_organizer.json
Contains organization information:
- company name
- img_local (path to logo image)

### forum_schedule.json
Contains event schedule:
- start_time (YYYY-MM-DD HH:MM:SS)
- title, session_type
- host, panelists (semicolon-separated)

### forum_speakers.json
Contains speaker profiles:
- name, position
- picture_local (path to profile image)

## Running the Site

Since this is now a static site, you can:

1. **Using a local web server:**
   ```bash
   npx serve .
   ```
   Then open http://localhost:3000

2. **Using Python:**
   ```bash
   python -m http.server 8000
   ```
   Then open http://localhost:8000

3. **Deploy to any static hosting** (GitHub Pages, Netlify, Vercel, etc.)

## Updating Data from PocketBase

If you need to update the data from PocketBase in the future:

1. Make sure PocketBase server is running at http://127.0.0.1:8090
2. Run the export script:
   ```bash
   npm run export
   ```
3. This will update all JSON files and download any new images

## Notes

- All images are stored locally in the `images/` folder
- No database connection required
- Can be hosted on any static hosting platform
- All data is loaded from JSON files using fetch API
