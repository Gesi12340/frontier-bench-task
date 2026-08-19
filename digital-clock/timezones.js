// Comprehensive list of world timezones
const TIMEZONES = [
    // Americas
    { name: 'New York', tz: 'America/New_York', continent: 'Americas' },
    { name: 'Los Angeles', tz: 'America/Los_Angeles', continent: 'Americas' },
    { name: 'Chicago', tz: 'America/Chicago', continent: 'Americas' },
    { name: 'Denver', tz: 'America/Denver', continent: 'Americas' },
    { name: 'Mexico City', tz: 'America/Mexico_City', continent: 'Americas' },
    { name: 'Toronto', tz: 'America/Toronto', continent: 'Americas' },
    { name: 'São Paulo', tz: 'America/Sao_Paulo', continent: 'Americas' },
    { name: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires', continent: 'Americas' },
    { name: 'Vancouver', tz: 'America/Vancouver', continent: 'Americas' },
    { name: 'Anchorage', tz: 'America/Anchorage', continent: 'Americas' },

    // Europe
    { name: 'London', tz: 'Europe/London', continent: 'Europe' },
    { name: 'Paris', tz: 'Europe/Paris', continent: 'Europe' },
    { name: 'Berlin', tz: 'Europe/Berlin', continent: 'Europe' },
    { name: 'Rome', tz: 'Europe/Rome', continent: 'Europe' },
    { name: 'Madrid', tz: 'Europe/Madrid', continent: 'Europe' },
    { name: 'Amsterdam', tz: 'Europe/Amsterdam', continent: 'Europe' },
    { name: 'Brussels', tz: 'Europe/Brussels', continent: 'Europe' },
    { name: 'Vienna', tz: 'Europe/Vienna', continent: 'Europe' },
    { name: 'Prague', tz: 'Europe/Prague', continent: 'Europe' },
    { name: 'Budapest', tz: 'Europe/Budapest', continent: 'Europe' },
    { name: 'Moscow', tz: 'Europe/Moscow', continent: 'Europe' },
    { name: 'Istanbul', tz: 'Europe/Istanbul', continent: 'Europe' },
    { name: 'Athens', tz: 'Europe/Athens', continent: 'Europe' },
    { name: 'Dublin', tz: 'Europe/Dublin', continent: 'Europe' },

    // Asia
    { name: 'Dubai', tz: 'Asia/Dubai', continent: 'Asia' },
    { name: 'Bangkok', tz: 'Asia/Bangkok', continent: 'Asia' },
    { name: 'Hong Kong', tz: 'Asia/Hong_Kong', continent: 'Asia' },
    { name: 'Shanghai', tz: 'Asia/Shanghai', continent: 'Asia' },
    { name: 'Singapore', tz: 'Asia/Singapore', continent: 'Asia' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', continent: 'Asia' },
    { name: 'Seoul', tz: 'Asia/Seoul', continent: 'Asia' },
    { name: 'New Delhi', tz: 'Asia/Kolkata', continent: 'Asia' },
    { name: 'Bangalore', tz: 'Asia/Kolkata', continent: 'Asia' },
    { name: 'Manila', tz: 'Asia/Manila', continent: 'Asia' },
    { name: 'Kuala Lumpur', tz: 'Asia/Kuala_Lumpur', continent: 'Asia' },
    { name: 'Jakarta', tz: 'Asia/Jakarta', continent: 'Asia' },
    { name: 'Ho Chi Minh City', tz: 'Asia/Ho_Chi_Minh', continent: 'Asia' },
    { name: 'Hanoi', tz: 'Asia/Ho_Chi_Minh', continent: 'Asia' },
    { name: 'Karachi', tz: 'Asia/Karachi', continent: 'Asia' },
    { name: 'Tehran', tz: 'Asia/Tehran', continent: 'Asia' },
    { name: 'Tel Aviv', tz: 'Asia/Jerusalem', continent: 'Asia' },

    // Africa
    { name: 'Cairo', tz: 'Africa/Cairo', continent: 'Africa' },
    { name: 'Lagos', tz: 'Africa/Lagos', continent: 'Africa' },
    { name: 'Johannesburg', tz: 'Africa/Johannesburg', continent: 'Africa' },
    { name: 'Nairobi', tz: 'Africa/Nairobi', continent: 'Africa' },
    { name: 'Casablanca', tz: 'Africa/Casablanca', continent: 'Africa' },
    { name: 'Accra', tz: 'Africa/Accra', continent: 'Africa' },
    { name: 'Dakar', tz: 'Africa/Dakar', continent: 'Africa' },

    // Australia & Oceania
    { name: 'Sydney', tz: 'Australia/Sydney', continent: 'Oceania' },
    { name: 'Melbourne', tz: 'Australia/Melbourne', continent: 'Oceania' },
    { name: 'Perth', tz: 'Australia/Perth', continent: 'Oceania' },
    { name: 'Brisbane', tz: 'Australia/Brisbane', continent: 'Oceania' },
    { name: 'Auckland', tz: 'Pacific/Auckland', continent: 'Oceania' },
    { name: 'Fiji', tz: 'Pacific/Fiji', continent: 'Oceania' },
    { name: 'Honolulu', tz: 'Pacific/Honolulu', continent: 'Oceania' },

    // UTC
    { name: 'UTC', tz: 'UTC', continent: 'UTC' }
];

// Sort timezones by continent and name
TIMEZONES.sort((a, b) => {
    if (a.continent !== b.continent) {
        return a.continent.localeCompare(b.continent);
    }
    return a.name.localeCompare(b.name);
});

// Default timezones to display on load
const DEFAULT_TIMEZONES = [
    'Europe/London',
    'America/New_York',
    'Asia/Tokyo',
    'Australia/Sydney'
];
