class MultiTimezoneClclock {
    constructor() {
        this.activeTzs = [];
        this.is24Hour = true;
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateTimezoneSelect();
        this.loadActiveTzs();
        this.startClock();
    }

    setupEventListeners() {
        const addBtn = document.getElementById('add-btn');
        const tzSelect = document.getElementById('timezone-select');
        const formatToggle = document.getElementById('format-toggle');
        const resetBtn = document.getElementById('reset-btn');

        addBtn.addEventListener('click', () => this.addTimezone());
        tzSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.addTimezone();
                e.target.value = '';
            }
        });

        formatToggle.addEventListener('change', () => this.toggleFormat());
        resetBtn.addEventListener('click', () => this.resetToDefault());

        // Allow adding timezone with Enter key
        tzSelect.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && tzSelect.value) {
                this.addTimezone();
                tzSelect.value = '';
            }
        });
    }

    populateTimezoneSelect() {
        const tzSelect = document.getElementById('timezone-select');
        let lastContinent = '';

        TIMEZONES.forEach(tz => {
            // Create optgroup for each continent
            if (tz.continent !== lastContinent) {
                if (lastContinent !== '') {
                    // Create optgroup
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = tz.continent;
                    tzSelect.appendChild(optgroup);
                }
                lastContinent = tz.continent;
            }

            const option = document.createElement('option');
            option.value = tz.tz;
            option.textContent = `${tz.name} (${tz.tz})`;
            tzSelect.appendChild(option);
        });
    }

    addTimezone() {
        const tzSelect = document.getElementById('timezone-select');
        const selectedTz = tzSelect.value;

        if (!selectedTz) return;

        // Check if timezone already exists
        if (this.activeTzs.includes(selectedTz)) {
            alert('This timezone is already displayed!');
            return;
        }

        this.activeTzs.push(selectedTz);
        this.saveActiveTzs();
        this.renderClock(selectedTz);
    }

    removeTimezone(tz) {
        this.activeTzs = this.activeTzs.filter(t => t !== tz);
        this.saveActiveTzs();
        this.render();
    }

    toggleFormat() {
        this.is24Hour = !this.is24Hour;
        const formatLabel = document.getElementById('format-label');
        formatLabel.textContent = this.is24Hour ? '24-hour' : '12-hour';
        this.render();
    }

    resetToDefault() {
        if (confirm('Reset to default timezones?')) {
            this.activeTzs = [...DEFAULT_TIMEZONES];
            this.saveActiveTzs();
            this.render();
        }
    }

    loadActiveTzs() {
        const saved = localStorage.getItem('activeTzs');
        this.activeTzs = saved ? JSON.parse(saved) : [...DEFAULT_TIMEZONES];
        this.render();
    }

    saveActiveTzs() {
        localStorage.setItem('activeTzs', JSON.stringify(this.activeTzs));
    }

    startClock() {
        this.updateClock();
        this.updateInterval = setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        
        this.activeTzs.forEach(tz => {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: !this.is24Hour
            });

            const dateFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

            // Update time display
            const timeStr = formatter.format(now);
            const dateStr = dateFormatter.format(now);

            const timeEl = document.querySelector(`[data-tz="${tz}"] .digital-time`);
            const dateEl = document.querySelector(`[data-tz="${tz}"] .date-info`);
            const dayEl = document.querySelector(`[data-tz="${tz}"] .day-of-week`);
            const periodEl = document.querySelector(`[data-tz="${tz}"] .time-period`);
            const hourHandEl = document.querySelector(`[data-tz="${tz}"] .hour-hand`);
            const minuteHandEl = document.querySelector(`[data-tz="${tz}"] .minute-hand`);
            const secondHandEl = document.querySelector(`[data-tz="${tz}"] .second-hand`);

            if (timeEl) {
                timeEl.textContent = timeStr;
            }

            if (dateEl && dateStr) {
                const [dayName, monthDayYear] = dateStr.split(', ');
                if (dayEl) dayEl.textContent = dayName;
                if (dateEl) dateEl.textContent = monthDayYear;
            }

            // Update analog clock
            if (hourHandEl && minuteHandEl && secondHandEl) {
                const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
                const hours = tzDate.getHours();
                const minutes = tzDate.getMinutes();
                const seconds = tzDate.getSeconds();

                const secondDegrees = (seconds / 60) * 360;
                const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
                const hourDegrees = (hours / 12) * 360 + (minutes / 60) * 30;

                secondHandEl.style.transform = `rotate(${secondDegrees}deg)`;
                minuteHandEl.style.transform = `rotate(${minuteDegrees}deg)`;
                hourHandEl.style.transform = `rotate(${hourDegrees}deg)`;
            }

            // Update AM/PM for 12-hour format
            if (!this.is24Hour && periodEl) {
                const isPM = timeStr.includes('PM');
                periodEl.textContent = isPM ? 'PM' : 'AM';
            } else if (periodEl) {
                periodEl.textContent = '';
            }
        });
    }

    renderClock(tz) {
        const container = document.getElementById('clocks-container');
        const tzInfo = TIMEZONES.find(t => t.tz === tz) || { name: tz, tz: tz };

        const clockCard = document.createElement('div');
        clockCard.className = 'clock-card new-card';
        clockCard.setAttribute('data-tz', tz);

        // Calculate timezone offset
        const now = new Date();
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
        const offset = (tzDate - utcDate) / (1000 * 60 * 60);
        const offsetStr = `UTC${offset >= 0 ? '+' : ''}${offset.toFixed(1)}`;

        clockCard.innerHTML = `
            <div class="timezone-name">${tzInfo.name}</div>
            <div class="timezone-offset">${offsetStr}</div>
            
            <div class="analog-clock">
                <div class="clock-face">
                    <div class="hand hour-hand"></div>
                    <div class="hand minute-hand"></div>
                    <div class="hand second-hand"></div>
                    <div class="center-dot"></div>
                </div>
            </div>

            <div class="digital-time">--:--:--</div>
            <div class="time-period"></div>
            <div class="day-of-week"></div>
            <div class="date-info"></div>

            <button class="remove-btn">Remove</button>
        `;

        const removeBtn = clockCard.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => this.removeTimezone(tz));

        container.appendChild(clockCard);
        this.updateClock();
    }

    render() {
        const container = document.getElementById('clocks-container');
        container.innerHTML = '';

        if (this.activeTzs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🌍</div>
                    <h2>No Timezones Selected</h2>
                    <p>Add a timezone from the dropdown above to get started</p>
                </div>
            `;
            return;
        }

        this.activeTzs.forEach(tz => this.renderClock(tz));
    }
}

// Initialize the clock app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MultiTimezoneClclock();
});
