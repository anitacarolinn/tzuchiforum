// Load JSON data from /data folder

// Load all partials first
async function loadPartials() {
    const includes = document.querySelectorAll("[data-include]");
    const promises = Array.from(includes).map(async el => {
        const file = el.getAttribute("data-include");
        const html = await fetch(file).then(r => r.text());
        el.innerHTML = html;
    });
    await Promise.all(promises);
}

// --- Data Loading (loads from /data folder) ---
async function fetchForumInfo() {
    try {
        const response = await fetch('data/forum_info.json');
        const records = await response.json();
        console.log('Forum Info:', records);
        if (records.length > 0) {
            renderForumInfo(records[0]); // Use the first record
        }
    } catch (error) {
        console.error('Error loading forum info:', error);
    }
}


async function fetchForumSchedule() {
    try {
        const response = await fetch('data/forum_schedule.json');
        const records = await response.json();
        console.log('Schedule:', records);
        renderSchedule(records);
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

async function fetchForumSpeakers() {
    try {
        const response = await fetch('data/forum_speakers.json');
        const records = await response.json();
        console.log('Speakers:', records);
        renderSpeakers(records);
    } catch (error) {
        console.error('Error loading speakers:', error);
    }
}

// --- Render Functions ---
function renderForumInfo(info) {
    // Update hero section with forum info
    const titleElement = document.querySelector('.hero-title');
    const themeElement = document.querySelector('.hero-theme');
    const quoteElement = document.querySelector('.hero-quote');
    const datesElement = document.querySelector('.hero-dates');
    const countryElement = document.querySelector('.hero-country');
    const locationsElement = document.querySelector('.hero-locations');
    const descriptionElement = document.querySelector('.hero-description');

    if (titleElement) titleElement.textContent = info.title || 'The 10th Tzu Chi Forum';
    if (themeElement) themeElement.textContent = info.theme || 'Technology for Goodness';
    if (quoteElement) quoteElement.textContent = info.quote;
    if (countryElement) countryElement.textContent = info.country || 'Hong Kong';

    if (datesElement) {
        let datesText = info.dates || 'December 4-5, 2025';
        if (datesText.includes(';')) {
            datesText = datesText.split(';').join('<br>');
        }
        datesElement.innerHTML = datesText;

        // Reset styles to measure natural width
        datesElement.style.width = 'auto';

        // Use a timeout to allow the browser to render and calculate the widths
        setTimeout(() => {
            const dateWidth = datesElement.scrollWidth;
            const buffer = 5;
            const finalWidth = dateWidth + buffer;
            datesElement.style.width = `${finalWidth}px`;
        }, 0);
    }

    if (countryElement) {
        countryElement.style.width = 'auto';
        setTimeout(() => {
            const countryWidth = countryElement.scrollWidth;
            const buffer = 5;
            const finalWidth = countryWidth + buffer;
            countryElement.style.width = `${finalWidth}px`;
        }, 0);
    }

    if (descriptionElement) descriptionElement.textContent = info.description || '"Leveraging innovation to cultivate a world of compassion and sustainable well-being."';

    // Agenda Location Logic
    const agendaLocationDay1 = document.querySelector('.agenda-location-day-1');
    const agendaLocationDay2 = document.querySelector('.agenda-location-day-2');

    if (agendaLocationDay1 && agendaLocationDay2 && info.locations) {
        const locationsArray = info.locations.split(';');

        // Location links for Google Maps
        const locationLinks = {
            'Hang Seng University, Hong Kong': 'https://maps.app.goo.gl/WogTJWLbScG3nqUD9',
            'Tzu Chi Charity Foundation, Kowloon Tong': 'https://maps.app.goo.gl/YNUmgDpttWABwQpR7'
        };

        if (locationsArray.length > 0) {
            const location1 = locationsArray[0].trim();
            const location1Base = location1.split('<br>')[0].trim();
            const link1 = locationLinks[location1Base] || '#';
            agendaLocationDay1.innerHTML = `
                <span class="material-symbols-outlined text-lg">location_on</span>
                <a href="${link1}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-[#0073a5] transition-colors cursor-pointer font-semibold flex items-center gap-1">
                    ${location1}
                    <span class="material-symbols-outlined text-sm">open_in_new</span>
                </a>
            `;
        }
        if (locationsArray.length > 1) {
            const location2 = locationsArray[1].trim();
            const location2Base = location2.split('<br>')[0].trim();
            const link2 = locationLinks[location2Base] || '#';
            agendaLocationDay2.innerHTML = `
                <span class="material-symbols-outlined text-lg">location_on</span>
                <a href="${link2}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-[#0073a5] transition-colors cursor-pointer font-semibold flex items-center gap-1">
                    ${location2}
                    <span class="material-symbols-outlined text-sm">open_in_new</span>
                </a>
            `;
        }
    }

    if (daysCountdownElement && hoursCountdownElement && info.dates) {
        // Get the first date from the string (e.g., "2025-12-04;2025-12-05")
        const firstDateString = info.dates.split(';')[0];
        const forumDate = new Date(firstDateString);
        // Set the target time to 08:00
        forumDate.setHours(8, 0, 0, 0);

        const today = new Date();

        if (forumDate > today) {
            const diffTime = forumDate - today;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            daysCountdownElement.textContent = diffDays;
            hoursCountdownElement.textContent = diffHours;
        } else {
            daysCountdownElement.textContent = '0';
            hoursCountdownElement.textContent = '0';
        }
    } else if (daysCountdownElement && hoursCountdownElement) {
        // Fallback if no date is provided
        daysCountdownElement.textContent = '...';
        hoursCountdownElement.textContent = '...';
    }

    // --- About Section Logic ---
    const aboutTitleElement = document.getElementById('about-title');
    if (aboutTitleElement && info.title) {
        aboutTitleElement.textContent = `Welcome to The 10th Tzu Chi Forum 2025`;
    }

    const aboutDesc1Element = document.getElementById('about-desc-1');
    const aboutDesc2Element = document.getElementById('about-desc-2');
    if (aboutDesc1Element && aboutDesc2Element) {
        aboutDesc1Element.textContent = `Under the theme 'Technology for Goodness,' we confront the challenge of balancing rapid technological progress with timeless humanistic values. We aim to foster a dialogue on how innovation, guided by the Tzu Chi principles of sincerity, integrity, trust, and honesty, can serve humanity with wisdom and compassion.`;
        aboutDesc2Element.textContent = `This forum is dedicated to exploring practical applications of technology in humanitarian aid, sustainable development, and societal well-being. Our ultimate goal is to inspire action that harmonizes technological advancement with the core values that connect us all.`;
    }

    const aboutHeroBg = document.getElementById('about-hero-bg');
    const aboutSideImage = document.getElementById('about-side-image');

    // Use the new AI tech background image
    const imageUrl = 'assets/ai-tech-bg.png';
    if (aboutHeroBg) {
        aboutHeroBg.style.backgroundImage = `url('${imageUrl}')`;
    }
    if (aboutSideImage) {
        aboutSideImage.style.backgroundImage = `url('${imageUrl}')`;
    }
}


function renderSchedule(scheduleItems) {
    const day1Container = document.querySelector('.agenda-day-1');
    const day2Container = document.querySelector('.agenda-day-2');

    if (!day1Container || !day2Container) {
        console.error('Agenda containers not found');
        return;
    }

    // Clear existing content
    day1Container.innerHTML = '';
    day2Container.innerHTML = '';

    // Group items by date
    const scheduleByDate = {
        '2025-12-04': [],
        '2025-12-05': []
    };

    scheduleItems.forEach(item => {
        const itemDate = item.start_time.substring(0, 10);
        if (scheduleByDate[itemDate]) {
            scheduleByDate[itemDate].push(item);
        }
    });

    // Function to get icon name based on the title
    const getIconForTitle = (title) => {
        if (!title) return 'schedule';
        const normalizedTitle = title.toLowerCase();

        if (normalizedTitle.includes('lunch')) {
            return 'restaurant';
        } else if (normalizedTitle.includes('keynote')) {
            return 'key';
        } else if (normalizedTitle.includes('panel discussion')) {
            return 'forum';
        } else if (normalizedTitle.includes('reception')) {
            return 'celebration';
        } else if (normalizedTitle.includes('opening ceremony')) {
            return 'emoji_events';
        } else if (normalizedTitle.includes('closing ceremony')) {
            return 'waving_hand';
        } else {
            return 'schedule';
        }
    };

    // Function to generate HTML for a list of people from a semicolon-separated string
    const createPeopleList = (peopleString) => {
        if (!peopleString) return '';
        const people = peopleString.split(';').map(p => p.trim()).filter(p => p); // trim and remove empty entries
        return `
            <ul class="mt-2 space-y-1 text-gray-600 list-disc list-inside text-sm">
                ${people.map(person => `<li>${person}</li>`).join('')}
            </ul>
        `;
    };

    // Function to generate HTML for a single agenda item
    const createItemHTML = (item) => {
        const time = item.start_time.substring(11, 16); // Extracts "HH:MM" from "YYYY-MM-DD HH:MM:SS"

        const sessionTypeHTML = item.session_type ? `<p class="text-sm text-gray-600 mt-1 italic">${item.session_type}</p>` : '';

        let peopleHTML = '';
        const hosts = item.host;
        const panelists = item.panelists;

        const hostsHTML = hosts ? `
            <div>
                <p class="font-semibold text-gray-700">Host:</p>
                ${createPeopleList(hosts)}
            </div>
        ` : '';

        const panelistsHTML = panelists ? `
            <div>
                <p class="font-semibold text-gray-700">Panelists:</p>
                ${createPeopleList(panelists)}
            </div>
        ` : '';

        if (hostsHTML || panelistsHTML) {
            peopleHTML = `
                <div class="mt-4 space-y-3">
                    ${hostsHTML}
                    ${panelistsHTML}
                </div>
            `;
        }

        const iconName = getIconForTitle(item.title);

        return `
            <div class="relative agenda-item">
                <div class="absolute -left-[31px] sm:-left-[47px] top-0 flex items-center justify-center">
                    <div class="w-8 h-8 rounded-full bg-primary ring-4 ring-gray-50 flex items-center justify-center shadow-sm">
                         <span class="material-symbols-outlined text-base text-white">${iconName}</span>
                    </div>
                </div>
                <div class="ml-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md">
                    <p class="font-semibold text-base text-gray-500 mb-2">${time}</p>
                    <h4 class="text-xl font-bold text-primary mb-1">${item.title}</h4>
                    ${sessionTypeHTML}
                    ${peopleHTML}
                </div>
            </div>
        `;
    };

    // Populate day 1
    scheduleByDate['2025-12-04'].forEach(item => {
        day1Container.innerHTML += createItemHTML(item);
    });

    // Populate day 2
    scheduleByDate['2025-12-05'].forEach(item => {
        day2Container.innerHTML += createItemHTML(item);
    });
}

function renderSpeakers(speakers) {
    const container = document.querySelector('.speakers-container');
    if (!container) {
        console.error('Speaker container not found');
        return;
    }

    // Clear existing speakers
    container.innerHTML = '';

    speakers.forEach(speaker => {
        const speakerCard = document.createElement('div');
        speakerCard.className = 'speaker-card';

        // Use Cloudflare hosted images (2K variant), fallback to local if needed
        const imageUrl = speaker.picture_url || speaker.picture;

        // Add line break before Chinese name in parentheses
        let displayName = speaker.name;
        if (displayName.includes('(') && /[\u4e00-\u9fa5]/.test(displayName)) {
            displayName = displayName.replace(/\s*\(/g, '<br>(');
        }

        speakerCard.innerHTML = `
            <img src="${imageUrl}" alt="${speaker.name}" class="speaker-image">
            <div class="speaker-info">
                <h3 class="speaker-name">${displayName}</h3>
                <p class="speaker-position">${speaker.position}</p>
            </div>
        `;
        container.appendChild(speakerCard);
    });
}

// Initialize: Load all data and add event listeners
async function init() {
    // Load all embedded data
    await Promise.all([
        fetchForumInfo(),
        fetchForumSchedule(),
        fetchForumSpeakers()
    ]);

    // Add event listeners for scrolling
    const aboutBtn = document.getElementById('about-forum-btn');
    const agendaBtn = document.getElementById('view-agenda-btn');
    const speakersBtn = document.getElementById('featured-speakers-btn');

    const aboutSection = document.getElementById('about-section');
    const agendaSection = document.getElementById('agenda-section');
    const speakersSection = document.getElementById('featured-speakers-section');

    // Function to set active button
    const setActiveNavButton = (activeBtn) => {
        // Remove active class from all buttons
        [aboutBtn, agendaBtn, speakersBtn].forEach(btn => {
            if (btn) btn.classList.remove('nav-btn-active');
        });
        // Add active class to the clicked button
        if (activeBtn) activeBtn.classList.add('nav-btn-active');
    };

    // Scroll spy: Activate button based on current section in view
    const handleScrollSpy = () => {
        const scrollPosition = window.scrollY + 200; // Offset for sticky header

        // Get section positions
        const aboutTop = aboutSection?.offsetTop || 0;
        const agendaTop = agendaSection?.offsetTop || 0;
        const speakersTop = speakersSection?.offsetTop || 0;

        // Determine which section is currently in view
        if (scrollPosition >= speakersTop) {
            setActiveNavButton(speakersBtn);
        } else if (scrollPosition >= agendaTop) {
            setActiveNavButton(agendaBtn);
        } else if (scrollPosition >= aboutTop) {
            setActiveNavButton(aboutBtn);
        }
    };

    // Add scroll event listener for scroll spy
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        // Debounce scroll event for performance
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScrollSpy, 10);
    });

    // Initial call to set active button on page load
    handleScrollSpy();

    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (agendaBtn) {
        agendaBtn.addEventListener('click', () => {
            document.getElementById('agenda-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (speakersBtn) {
        speakersBtn.addEventListener('click', () => {
            document.getElementById('featured-speakers-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Agenda button logic
    const btnDay1 = document.getElementById('btn-day-1');
    const btnDay2 = document.getElementById('btn-day-2');
    const scheduleDay1 = document.getElementById('schedule-day-1');
    const scheduleDay2 = document.getElementById('schedule-day-2');

    if (btnDay1 && btnDay2 && scheduleDay1 && scheduleDay2) {
        btnDay1.addEventListener('click', () => {
            scheduleDay1.style.display = 'block';
            scheduleDay2.style.display = 'none';
            // Day 1 active state
            btnDay1.classList.add('bg-primary', 'text-white', 'shadow-xl', 'shadow-primary/30');
            btnDay1.classList.remove('bg-gray-200', 'text-gray-800', 'shadow-lg');
            // Day 2 inactive state
            btnDay2.classList.add('bg-gray-200', 'text-gray-800', 'shadow-lg');
            btnDay2.classList.remove('bg-primary', 'text-white', 'shadow-xl', 'shadow-primary/30');
        });

        btnDay2.addEventListener('click', () => {
            scheduleDay1.style.display = 'none';
            scheduleDay2.style.display = 'block';
            // Day 2 active state
            btnDay2.classList.add('bg-primary', 'text-white', 'shadow-xl', 'shadow-primary/30');
            btnDay2.classList.remove('bg-gray-200', 'text-gray-800', 'shadow-lg');
            // Day 1 inactive state
            btnDay1.classList.add('bg-gray-200', 'text-gray-800', 'shadow-lg');
            btnDay1.classList.remove('bg-primary', 'text-white', 'shadow-xl', 'shadow-primary/30');
        });
    }
}

// Run init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
