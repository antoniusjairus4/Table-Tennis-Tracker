// Table Tennis Performance Tracker App
class TTTracker {
    constructor() {
        this.trainingSessions = [];
        this.matches = [];
        this.charts = {};
        
        this.init();
    }

    init() {
        this.loadData();
        this.initSampleData();
        this.setupEventListeners();
        this.updateDashboard();
        this.setDefaultDates();
        this.updateOpponentsList();
    }

    // Data Management
    loadData() {
        try {
            const trainingData = localStorage.getItem('ttTracker_training');
            const matchData = localStorage.getItem('ttTracker_matches');
            
            this.trainingSessions = trainingData ? JSON.parse(trainingData) : [];
            this.matches = matchData ? JSON.parse(matchData) : [];
        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading saved data', 'error');
        }
    }

    saveData() {
        try {
            localStorage.setItem('ttTracker_training', JSON.stringify(this.trainingSessions));
            localStorage.setItem('ttTracker_matches', JSON.stringify(this.matches));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('Error saving data', 'error');
        }
    }

    initSampleData() {
        if (this.trainingSessions.length === 0 && this.matches.length === 0) {
            // Add sample training sessions with correct drill categories
            this.trainingSessions = [
                {
                    id: Date.now() - 86400000,
                    date: "2025-01-20",
                    duration: 90,
                    drillCategory: "Footwork & Movement",
                    notes: "Focused on side-to-side movement drills",
                    timestamp: Date.now() - 86400000
                },
                {
                    id: Date.now() - 172800000,
                    date: "2025-01-18",
                    duration: 60,
                    drillCategory: "Serve Practice (Pendulum, Reverse, Side Spin)",
                    notes: "Practiced short serves and pendulum serves. Good improvement in spin variation.",
                    timestamp: Date.now() - 172800000
                }
            ];

            // Add sample matches
            this.matches = [
                {
                    id: Date.now() - 259200000,
                    date: "2025-01-19",
                    opponent: "Practice Partner",
                    matchType: "Friendly",
                    gameScores: "11-9, 11-7, 9-11, 11-6",
                    gamesWon: 3,
                    gamesLost: 1,
                    outcome: "Win",
                    emotionalTags: ["Confident", "Focused"],
                    duration: 45,
                    tacticalNotes: "Good forehand loops, need to work on backhand defense",
                    timestamp: Date.now() - 259200000
                }
            ];

            this.saveData();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation - Bottom nav with proper event delegation
        document.addEventListener('click', (e) => {
            // Handle navigation clicks
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                e.stopPropagation();
                const section = navItem.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
                return;
            }

            // Handle action button clicks
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                e.preventDefault();
                e.stopPropagation();
                const section = actionBtn.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
                return;
            }

            // Handle tab button clicks
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn) {
                e.preventDefault();
                e.stopPropagation();
                const tab = tabBtn.getAttribute('data-tab');
                const section = tabBtn.closest('.section');
                if (tab && section) {
                    this.showTab(section.id, tab);
                }
                return;
            }

            // Handle preset duration buttons
            const presetBtn = e.target.closest('.preset-btn');
            if (presetBtn) {
                e.preventDefault();
                const duration = presetBtn.getAttribute('data-duration');
                const durationSlider = document.getElementById('trainingDurationSlider');
                const durationNumber = document.getElementById('trainingDuration');
                if (durationSlider) durationSlider.value = duration;
                if (durationNumber) durationNumber.value = duration;
                return;
            }

            // Handle export button
            if (e.target.closest('#exportDataBtn')) {
                e.preventDefault();
                this.exportData();
                return;
            }

            // Handle import button
            if (e.target.closest('#importDataBtn')) {
                e.preventDefault();
                const importInput = document.getElementById('importFileInput');
                if (importInput) {
                    importInput.click();
                }
                return;
            }
        });

        // Forms
        const trainingForm = document.getElementById('trainingForm');
        if (trainingForm) {
            trainingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTrainingSession();
            });
        }

        const matchForm = document.getElementById('matchForm');
        if (matchForm) {
            matchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveMatch();
            });
        }

        // Duration slider sync
        const durationSlider = document.getElementById('trainingDurationSlider');
        const durationNumber = document.getElementById('trainingDuration');
        
        if (durationSlider && durationNumber) {
            durationSlider.addEventListener('input', (e) => {
                durationNumber.value = e.target.value;
            });
            
            durationNumber.addEventListener('input', (e) => {
                if (e.target.value >= 15 && e.target.value <= 240) {
                    durationSlider.value = e.target.value;
                }
            });
        }

        // Score calculation
        const gamesWon = document.getElementById('gamesWon');
        const gamesLost = document.getElementById('gamesLost');
        if (gamesWon) gamesWon.addEventListener('input', this.updateMatchOutcome.bind(this));
        if (gamesLost) gamesLost.addEventListener('input', this.updateMatchOutcome.bind(this));

        // Filters
        const trainingDateFilter = document.getElementById('trainingDateFilter');
        const drillCategoryFilter = document.getElementById('drillCategoryFilter');
        const matchDateFilter = document.getElementById('matchDateFilter');
        const matchTypeFilter = document.getElementById('matchTypeFilter');

        if (trainingDateFilter) {
            trainingDateFilter.addEventListener('change', () => {
                this.filterTrainingHistory();
            });
        }
        
        if (drillCategoryFilter) {
            drillCategoryFilter.addEventListener('change', () => {
                this.filterTrainingHistory();
            });
        }
        
        if (matchDateFilter) {
            matchDateFilter.addEventListener('change', () => {
                this.filterMatchHistory();
            });
        }
        
        if (matchTypeFilter) {
            matchTypeFilter.addEventListener('change', () => {
                this.filterMatchHistory();
            });
        }

        // File import
        const importInput = document.getElementById('importFileInput');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.importData(e.target.files[0]);
                }
                e.target.value = ''; // Reset input
            });
        }
    }

    // Navigation
    showSection(sectionId) {
        console.log('Showing section:', sectionId);
        
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Section shown:', sectionId);
        } else {
            console.error('Section not found:', sectionId);
            return;
        }
        
        // Update navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // Load section-specific data
        if (sectionId === 'analytics') {
            // Small delay to ensure DOM is ready
            setTimeout(() => this.updateCharts(), 200);
        } else if (sectionId === 'training') {
            setTimeout(() => this.filterTrainingHistory(), 100);
        } else if (sectionId === 'matches') {
            setTimeout(() => this.filterMatchHistory(), 100);
        }
    }

    showTab(sectionId, tabId) {
        console.log('Showing tab:', tabId, 'in section:', sectionId);
        
        const section = document.getElementById(sectionId);
        if (!section) {
            console.error('Section not found:', sectionId);
            return;
        }
        
        // Hide all tab contents in this section
        const tabContents = section.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show target tab
        const targetTab = section.querySelector(`#${tabId}`);
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error('Tab not found:', tabId);
        }
        
        // Update tab buttons
        const tabBtns = section.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeTabBtn = section.querySelector(`[data-tab="${tabId}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }
    }

    // Training Management
    saveTrainingSession() {
        console.log('Saving training session...');
        
        const trainingDate = document.getElementById('trainingDate');
        const trainingDuration = document.getElementById('trainingDuration');
        const drillCategory = document.getElementById('drillCategory');
        const trainingNotes = document.getElementById('trainingNotes');

        if (!trainingDate || !trainingDuration || !drillCategory) {
            this.showMessage('Required form elements not found', 'error');
            return;
        }
        
        // Get values
        const dateValue = trainingDate.value;
        const durationValue = parseInt(trainingDuration.value);
        const categoryValue = drillCategory.value;
        const notesValue = trainingNotes ? trainingNotes.value.trim() : '';

        // Validate required fields
        if (!dateValue || !durationValue || !categoryValue) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (durationValue < 15 || durationValue > 240) {
            this.showMessage('Duration must be between 15 and 240 minutes', 'error');
            return;
        }

        const session = {
            id: Date.now(),
            date: dateValue,
            duration: durationValue,
            drillCategory: categoryValue,
            notes: notesValue,
            timestamp: Date.now()
        };

        console.log('Training session data:', session);

        this.trainingSessions.unshift(session);
        this.saveData();
        
        this.showMessage('Training session saved successfully!', 'success');
        
        // Reset form
        const form = document.getElementById('trainingForm');
        if (form) {
            form.reset();
        }
        
        this.setDefaultDates();
        this.updateDashboard();
        this.filterTrainingHistory();
    }

    // Match Management
    saveMatch() {
        console.log('Saving match...');
        
        const matchDate = document.getElementById('matchDate');
        const opponent = document.getElementById('opponent');
        const matchType = document.getElementById('matchType');
        const gamesWon = document.getElementById('gamesWon');
        const gamesLost = document.getElementById('gamesLost');
        const gameScores = document.getElementById('gameScores');
        const matchDuration = document.getElementById('matchDuration');
        const matchNotes = document.getElementById('matchNotes');

        if (!matchDate || !opponent || !matchType || !gamesWon || !gamesLost) {
            this.showMessage('Required form elements not found', 'error');
            return;
        }
        
        // Get values
        const dateValue = matchDate.value;
        const opponentValue = opponent.value.trim();
        const typeValue = matchType.value;
        const wonValue = parseInt(gamesWon.value);
        const lostValue = parseInt(gamesLost.value);
        const scoresValue = gameScores ? gameScores.value.trim() : '';
        const durationValue = matchDuration && matchDuration.value ? parseInt(matchDuration.value) : null;
        const notesValue = matchNotes ? matchNotes.value.trim() : '';

        // Validate required fields
        if (!dateValue || !opponentValue || !typeValue) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (wonValue < 0 || lostValue < 0) {
            this.showMessage('Game scores cannot be negative', 'error');
            return;
        }

        if (wonValue === 0 && lostValue === 0) {
            this.showMessage('Please enter valid game scores', 'error');
            return;
        }

        const match = {
            id: Date.now(),
            date: dateValue,
            opponent: opponentValue,
            matchType: typeValue,
            gamesWon: wonValue,
            gamesLost: lostValue,
            gameScores: scoresValue,
            outcome: wonValue > lostValue ? 'Win' : 'Loss',
            emotionalTags: Array.from(document.querySelectorAll('#emotionalTags input:checked')).map(cb => cb.value),
            duration: durationValue,
            tacticalNotes: notesValue,
            timestamp: Date.now()
        };

        console.log('Match data:', match);

        this.matches.unshift(match);
        this.saveData();
        
        this.showMessage('Match saved successfully!', 'success');
        
        // Reset form
        const form = document.getElementById('matchForm');
        if (form) {
            form.reset();
        }
        
        this.setDefaultDates();
        this.updateDashboard();
        this.updateOpponentsList();
        this.filterMatchHistory();
    }

    updateMatchOutcome() {
        const gamesWon = parseInt(document.getElementById('gamesWon')?.value || 0);
        const gamesLost = parseInt(document.getElementById('gamesLost')?.value || 0);
        
        // Visual feedback could be added here
        console.log('Match outcome updated:', gamesWon > gamesLost ? 'Win' : 'Loss');
    }

    // Dashboard Updates
    updateDashboard() {
        // Calculate stats
        const totalMatches = this.matches.length;
        const wins = this.matches.filter(m => m.outcome === 'Win').length;
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
        const totalTrainingTime = this.trainingSessions.reduce((sum, session) => sum + session.duration, 0);
        const trainingHours = Math.round(totalTrainingTime / 60 * 10) / 10;
        const trainingStreak = this.calculateTrainingStreak();

        // Update UI
        const totalMatchesEl = document.getElementById('totalMatches');
        const winRateEl = document.getElementById('winRate');
        const trainingStreakEl = document.getElementById('trainingStreak');
        const totalTrainingHoursEl = document.getElementById('totalTrainingHours');

        if (totalMatchesEl) totalMatchesEl.textContent = totalMatches;
        if (winRateEl) winRateEl.textContent = `${winRate}%`;
        if (trainingStreakEl) trainingStreakEl.textContent = trainingStreak;
        if (totalTrainingHoursEl) totalTrainingHoursEl.textContent = `${trainingHours}h`;

        // Update recent activities
        this.updateRecentActivities();
    }

    calculateTrainingStreak() {
        if (this.trainingSessions.length === 0) return 0;
        
        const sortedSessions = [...this.trainingSessions]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const today = new Date();
        let streak = 0;
        
        // Check if there's training today or yesterday
        const lastSessionDate = new Date(sortedSessions[0].date);
        const daysDiff = Math.floor((today - lastSessionDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) return 0; // Streak broken if no training in the last 2 days
        
        // Count consecutive days with training
        const dateSet = new Set(sortedSessions.map(session => session.date));
        const currentDate = new Date(today);
        
        while (true) {
            const dateString = currentDate.toISOString().split('T')[0];
            if (dateSet.has(dateString)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (streak === 0) {
                // Allow one day gap if we haven't started counting yet
                currentDate.setDate(currentDate.getDate() - 1);
                const yesterdayString = currentDate.toISOString().split('T')[0];
                if (dateSet.has(yesterdayString)) {
                    continue;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        
        return streak;
    }

    updateRecentActivities() {
        const container = document.getElementById('recentActivitiesList');
        if (!container) return;
        
        // Combine and sort recent activities
        const recentActivities = [
            ...this.trainingSessions.slice(0, 3).map(session => ({
                type: 'training',
                date: session.date,
                data: session
            })),
            ...this.matches.slice(0, 3).map(match => ({
                type: 'match',
                date: match.date,
                data: match
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        if (recentActivities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-message">No activities yet</div>
                    <div class="empty-state-description">Start by logging your first training session or match!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = recentActivities.map(activity => {
            if (activity.type === 'training') {
                return `
                    <div class="activity-item">
                        <div class="activity-info">
                            <div class="activity-type">🏃 Training Session</div>
                            <div class="activity-details">${activity.data.drillCategory} - ${activity.data.duration} minutes</div>
                        </div>
                        <div class="activity-date">${this.formatDate(activity.date)}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="activity-item">
                        <div class="activity-info">
                            <div class="activity-type">🏓 Match vs ${activity.data.opponent}</div>
                            <div class="activity-details">
                                <span class="match-outcome-${activity.data.outcome.toLowerCase()}">${activity.data.outcome}</span>
                                (${activity.data.gamesWon}-${activity.data.gamesLost})
                            </div>
                        </div>
                        <div class="activity-date">${this.formatDate(activity.date)}</div>
                    </div>
                `;
            }
        }).join('');
    }

    // History and Filtering
    filterTrainingHistory() {
        const dateFilter = document.getElementById('trainingDateFilter');
        const categoryFilter = document.getElementById('drillCategoryFilter');
        
        let filtered = [...this.trainingSessions];
        
        if (dateFilter && dateFilter.value) {
            const [year, month] = dateFilter.value.split('-');
            filtered = filtered.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate.getFullYear() === parseInt(year) && 
                       sessionDate.getMonth() === parseInt(month) - 1;
            });
        }
        
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(session => session.drillCategory === categoryFilter.value);
        }
        
        this.renderTrainingHistory(filtered);
    }

    renderTrainingHistory(sessions) {
        const container = document.getElementById('trainingHistoryList');
        if (!container) return;
        
        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏃</div>
                    <div class="empty-state-message">No training sessions found</div>
                    <div class="empty-state-description">Try adjusting your filters or log your first training session!</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sessions.map(session => `
            <div class="history-item">
                <div class="history-item-header">
                    <div>
                        <div class="history-item-title">🏃 Training Session</div>
                        <div class="history-item-subtitle">${session.drillCategory}</div>
                    </div>
                    <div class="history-item-date">${this.formatDate(session.date)}</div>
                </div>
                <div class="history-item-content">
                    <div class="history-detail">
                        <span class="history-detail-label">Duration:</span>
                        <span class="history-detail-value">${session.duration} minutes</span>
                    </div>
                    ${session.notes ? `<div class="history-notes">"${session.notes}"</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    filterMatchHistory() {
        const dateFilter = document.getElementById('matchDateFilter');
        const typeFilter = document.getElementById('matchTypeFilter');
        
        let filtered = [...this.matches];
        
        if (dateFilter && dateFilter.value) {
            const [year, month] = dateFilter.value.split('-');
            filtered = filtered.filter(match => {
                const matchDate = new Date(match.date);
                return matchDate.getFullYear() === parseInt(year) && 
                       matchDate.getMonth() === parseInt(month) - 1;
            });
        }
        
        if (typeFilter && typeFilter.value) {
            filtered = filtered.filter(match => match.matchType === typeFilter.value);
        }
        
        this.renderMatchHistory(filtered);
    }

    renderMatchHistory(matches) {
        const container = document.getElementById('matchHistoryList');
        if (!container) return;
        
        if (matches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏓</div>
                    <div class="empty-state-message">No matches found</div>
                    <div class="empty-state-description">Try adjusting your filters or log your first match!</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = matches.map(match => `
            <div class="history-item">
                <div class="history-item-header">
                    <div>
                        <div class="history-item-title">🏓 vs ${match.opponent}</div>
                        <div class="history-item-subtitle">${match.matchType}</div>
                    </div>
                    <div class="history-item-date">${this.formatDate(match.date)}</div>
                </div>
                <div class="history-item-content">
                    <div class="history-detail">
                        <span class="history-detail-label">Result:</span>
                        <span class="history-detail-value match-outcome-${match.outcome.toLowerCase()}">
                            ${match.outcome} (${match.gamesWon}-${match.gamesLost})
                        </span>
                    </div>
                    ${match.gameScores ? `
                        <div class="history-detail">
                            <span class="history-detail-label">Game Scores:</span>
                            <span class="history-detail-value">${match.gameScores}</span>
                        </div>
                    ` : ''}
                    ${match.duration ? `
                        <div class="history-detail">
                            <span class="history-detail-label">Duration:</span>
                            <span class="history-detail-value">${match.duration} minutes</span>
                        </div>
                    ` : ''}
                    ${match.emotionalTags.length > 0 ? `
                        <div class="tags-container">
                            ${match.emotionalTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${match.tacticalNotes ? `<div class="history-notes">"${match.tacticalNotes}"</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Charts and Analytics
    updateCharts() {
        console.log('Updating charts...');
        this.createTrainingChart();
        this.createDrillChart();
        this.createWinLossChart();
        this.createMatchTypeChart();
        this.createPerformanceTrendChart();
    }

    createTrainingChart() {
        const ctx = document.getElementById('trainingChart')?.getContext('2d');
        if (!ctx) {
            console.error('Training chart canvas not found');
            return;
        }
        
        if (this.charts.training) {
            this.charts.training.destroy();
        }

        // Get last 8 weeks of training data
        const last8Weeks = [];
        const today = new Date();
        
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            last8Weeks.push({
                start: weekStart.toISOString().split('T')[0],
                end: weekEnd.toISOString().split('T')[0],
                label: `Week ${8-i}`
            });
        }

        const trainingData = last8Weeks.map(week => {
            const weekTraining = this.trainingSessions
                .filter(session => session.date >= week.start && session.date <= week.end)
                .reduce((sum, session) => sum + session.duration, 0);
            return Math.round(weekTraining / 60 * 10) / 10; // Convert to hours
        });

        this.charts.training = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last8Weeks.map(week => week.label),
                datasets: [{
                    label: 'Training Hours',
                    data: trainingData,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                }
            }
        });
    }

    createDrillChart() {
        const ctx = document.getElementById('drillChart')?.getContext('2d');
        if (!ctx) {
            console.error('Drill chart canvas not found');
            return;
        }
        
        if (this.charts.drill) {
            this.charts.drill.destroy();
        }

        // Calculate drill distribution
        const drillData = {};
        this.trainingSessions.forEach(session => {
            drillData[session.drillCategory] = (drillData[session.drillCategory] || 0) + session.duration;
        });

        if (Object.keys(drillData).length === 0) {
            // Show empty state
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No training data yet', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'];

        this.charts.drill = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(drillData),
                datasets: [{
                    data: Object.values(drillData),
                    backgroundColor: colors.slice(0, Object.keys(drillData).length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createWinLossChart() {
        const ctx = document.getElementById('winLossChart')?.getContext('2d');
        if (!ctx) {
            console.error('Win/Loss chart canvas not found');
            return;
        }
        
        if (this.charts.winLoss) {
            this.charts.winLoss.destroy();
        }

        const wins = this.matches.filter(match => match.outcome === 'Win').length;
        const losses = this.matches.filter(match => match.outcome === 'Loss').length;

        if (wins === 0 && losses === 0) {
            // Show empty state
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No match data yet', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        this.charts.winLoss = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Wins', 'Losses'],
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: ['#1FB8CD', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createMatchTypeChart() {
        const ctx = document.getElementById('matchTypeChart')?.getContext('2d');
        if (!ctx) {
            console.error('Match type chart canvas not found');
            return;
        }
        
        if (this.charts.matchType) {
            this.charts.matchType.destroy();
        }

        // Calculate win rate by match type
        const matchTypeData = {};
        this.matches.forEach(match => {
            if (!matchTypeData[match.matchType]) {
                matchTypeData[match.matchType] = { wins: 0, total: 0 };
            }
            matchTypeData[match.matchType].total++;
            if (match.outcome === 'Win') {
                matchTypeData[match.matchType].wins++;
            }
        });

        if (Object.keys(matchTypeData).length === 0) {
            // Show empty state
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No match type data yet', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const labels = Object.keys(matchTypeData);
        const winRates = labels.map(type => 
            matchTypeData[type].total > 0 ? 
            Math.round((matchTypeData[type].wins / matchTypeData[type].total) * 100) : 0
        );

        this.charts.matchType = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Win Rate %',
                    data: winRates,
                    backgroundColor: '#1FB8CD'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Win Rate %'
                        }
                    }
                }
            }
        });
    }

    createPerformanceTrendChart() {
        const ctx = document.getElementById('performanceTrendChart')?.getContext('2d');
        if (!ctx) {
            console.error('Performance trend chart canvas not found');
            return;
        }
        
        if (this.charts.performanceTrend) {
            this.charts.performanceTrend.destroy();
        }

        // Group data by month
        const monthlyData = {};
        
        // Training data
        this.trainingSessions.forEach(session => {
            const monthKey = session.date.substring(0, 7); // YYYY-MM
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { training: 0, wins: 0, total: 0 };
            }
            monthlyData[monthKey].training += session.duration;
        });

        // Match data
        this.matches.forEach(match => {
            const monthKey = match.date.substring(0, 7); // YYYY-MM
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { training: 0, wins: 0, total: 0 };
            }
            monthlyData[monthKey].total++;
            if (match.outcome === 'Win') {
                monthlyData[monthKey].wins++;
            }
        });

        if (Object.keys(monthlyData).length === 0) {
            // Show empty state
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No performance data yet', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const sortedMonths = Object.keys(monthlyData).sort();
        const trainingHours = sortedMonths.map(month => Math.round(monthlyData[month].training / 60 * 10) / 10);
        const winRates = sortedMonths.map(month => 
            monthlyData[month].total > 0 ? 
            Math.round((monthlyData[month].wins / monthlyData[month].total) * 100) : 0
        );

        this.charts.performanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedMonths.map(month => {
                    const date = new Date(month + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: 'Training Hours',
                    data: trainingHours,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    yAxisID: 'y'
                }, {
                    label: 'Win Rate %',
                    data: winRates,
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Training Hours'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Win Rate %'
                        },
                        max: 100,
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    // Utility Functions
    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const trainingDate = document.getElementById('trainingDate');
        const matchDate = document.getElementById('matchDate');
        
        if (trainingDate && !trainingDate.value) trainingDate.value = today;
        if (matchDate && !matchDate.value) matchDate.value = today;
    }

    updateOpponentsList() {
        const datalist = document.getElementById('opponentsList');
        if (!datalist) return;
        
        const opponents = [...new Set(this.matches.map(match => match.opponent))];
        
        datalist.innerHTML = opponents.map(opponent => 
            `<option value="${opponent}">`
        ).join('');
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        if (!container) {
            console.log(`${type.toUpperCase()}: ${message}`);
            return;
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `message message--${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 4000);
    }

    // Data Import/Export
    exportData() {
        try {
            const data = {
                trainingSessions: this.trainingSessions,
                matches: this.matches,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tt-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Error exporting data', 'error');
        }
    }

    async importData(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.trainingSessions && Array.isArray(data.trainingSessions) && 
                data.matches && Array.isArray(data.matches)) {
                
                this.trainingSessions = data.trainingSessions;
                this.matches = data.matches;
                this.saveData();
                
                this.updateDashboard();
                this.updateOpponentsList();
                this.filterTrainingHistory();
                this.filterMatchHistory();
                
                this.showMessage('Data imported successfully!', 'success');
            } else {
                throw new Error('Invalid file format - missing required data structures');
            }
        } catch (error) {
            console.error('Import error:', error);
            this.showMessage('Error importing data. Please check the file format.', 'error');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing TT Tracker...');
    window.ttTracker = new TTTracker();
});