// Global variables
let token = localStorage.getItem('token');

// Show login/register tabs
function showTab(tabName) {
    document.getElementById('loginForm').style.display = tabName === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tabName === 'register' ? 'block' : 'none';
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === tabName);
    });
}

// Handle registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        username: document.getElementById('registerUsername').value,
        password: document.getElementById('registerPassword').value,
        leetcodeUsername: document.getElementById('registerLeetcodeUsername').value
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error);
        
        token = result.token;
        localStorage.setItem('token', token);
        initializeApp(data.leetcodeUsername);
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        username: document.getElementById('loginUsername').value,
        password: document.getElementById('loginPassword').value,
        leetcodeUsername: document.getElementById('loginLeetcodeUsername').value
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error);
        
        token = result.token;
        localStorage.setItem('token', token);
        initializeApp(data.leetcodeUsername);
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Initialize the application after successful auth
async function initializeApp(leetcodeUsername) {
    try {
        // Fetch LeetCode stats
        const response = await fetch(`/api/leetcode-stats/${leetcodeUsername}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch stats');
        }

        // Show main content
        document.getElementById('mainNav').style.display = 'block';
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('usernameDisplay').textContent = leetcodeUsername;

        // Update stats
        updateLeetCodeStats(data.data.matchedUser.submitStats.acSubmissionNum);

        // Initialize the problem tracker
        window.tracker = new ProblemTracker(leetcodeUsername);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to initialize application: ' + error.message);
    }
}

class ProblemTracker {
    constructor(username) {
        this.username = username;
        this.problems = [];
        this.form = document.getElementById('problemForm');
        this.problemsList = document.getElementById('problemsList');
        
        this.initializeEventListeners();
        this.loadProblems();
    }

    async loadProblems() {
        try {
            const response = await fetch('/api/problems', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            this.problems = data;
            this.updateUI();
        } catch (error) {
            console.error('Error loading problems:', error);
        }
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addProblem();
        });
    }

    async addProblem() {
        const problem = {
            name: document.getElementById('problemName').value,
            link: document.getElementById('problemLink').value,
            difficulty: document.getElementById('difficulty').value,
            dateCompleted: document.getElementById('dateCompleted').value,
            approach: document.getElementById('approach').value,
            solution: document.getElementById('solution').value,
            notes: document.getElementById('notes').value
        };

        try {
            const response = await fetch('/api/problems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(problem)
            });

            if (!response.ok) throw new Error('Failed to save problem');

            this.problems.push(problem);
            this.updateUI();
            this.form.reset();
        } catch (error) {
            console.error('Error saving problem:', error);
            alert('Failed to save problem');
        }
    }

    updateUI() {
        this.updateProblemsList();
    }

    updateProblemsList() {
        const problemsContainer = document.getElementById('problemsContainer');
        problemsContainer.innerHTML = '';
        
        const sortedProblems = [...this.problems].sort((a, b) => 
            new Date(b.dateCompleted) - new Date(a.dateCompleted)
        );

        sortedProblems.forEach(problem => {
            const problemCard = document.createElement('div');
            problemCard.className = `problem-card ${problem.difficulty} collapsed`;
            
            problemCard.innerHTML = `
                <div class="problem-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3>${problem.name}</h3>
                    <div class="problem-meta">
                        <span class="difficulty-tag ${problem.difficulty}">
                            ${problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                        <span class="date-tag">
                            ${new Date(problem.dateCompleted).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div class="problem-content">
                    <a href="${problem.link}" target="_blank" class="problem-link">View on LeetCode</a>
                    
                    <div class="problem-approach">
                        <strong>Approach:</strong>
                        <div>${problem.approach}</div>
                    </div>
                    
                    <div class="problem-solution">
                        <strong>Solution:</strong>
                        <pre><code>${problem.solution}</code></pre>
                    </div>
                    
                    ${problem.notes ? `
                        <div class="problem-notes">
                            <strong>Notes:</strong>
                            <div>${problem.notes}</div>
                        </div>
                    ` : ''}
                    
                    <button onclick="tracker.deleteProblem(${problem.id})" class="delete-btn">
                        Delete
                    </button>
                </div>
            `;

            problemsContainer.appendChild(problemCard);
        });
    }

    deleteProblem(id) {
        this.problems = this.problems.filter(problem => problem.id !== id);
        this.updateUI();
    }
}

function updateLeetCodeStats(stats) {
    const leetcodeStats = document.getElementById('leetcodeStats');
    leetcodeStats.innerHTML = '';

    const difficultyColors = {
        'EASY': '#00B8A3',
        'MEDIUM': '#FFA116',
        'HARD': '#FF375F'
    };

    const totalProblems = stats.reduce((acc, curr) => acc + curr.count, 0);

    stats.forEach(stat => {
        const percentage = totalProblems ? Math.round((stat.count / totalProblems) * 100) : 0;
        const color = difficultyColors[stat.difficulty];
        
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <div class="circle-progress">
                <svg width="150" height="150">
                    <circle class="background"
                        cx="75" cy="75" r="70"
                        stroke="rgba(255, 255, 255, 0.1)"
                    />
                    <circle class="progress"
                        cx="75" cy="75" r="70"
                        stroke="${color}"
                        style="--percentage: ${percentage}"
                    />
                </svg>
                <div class="stat-value" style="color: ${color}">${stat.count}</div>
            </div>
            <div class="stat-title">${stat.difficulty.charAt(0) + stat.difficulty.slice(1).toLowerCase()}</div>
            <div class="stat-percentage" style="color: ${color}">${percentage}%</div>
        `;

        // Add entrance animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        leetcodeStats.appendChild(card);

        // Trigger animation
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, stats.indexOf(stat) * 200);
    });
}

// Add enter key support for the username input
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('initialUsername');
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            initializeApp(usernameInput.value.trim());
        }
    });
});

function logout() {
    localStorage.removeItem('token');
    document.getElementById('mainNav').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

// Add some CSS for the auth forms
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .auth-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .tab-btn {
            flex: 1;
            padding: 0.5rem;
            border: none;
            background: none;
            color: var(--text-secondary);
            cursor: pointer;
        }
        
        .tab-btn.active {
            color: var(--primary-orange);
            border-bottom: 2px solid var(--primary-orange);
        }
        
        .auth-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
    </style>
`);

// Add this after your existing code
document.addEventListener('DOMContentLoaded', () => {
    const problemsList = document.querySelector('.problems-list');
    const toggleButton = document.getElementById('toggleProblems');
    
    toggleButton.addEventListener('click', () => {
        problemsList.classList.toggle('open');
        toggleButton.classList.toggle('open');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!problemsList.contains(e.target) && 
            !toggleButton.contains(e.target) && 
            problemsList.classList.contains('open')) {
            problemsList.classList.remove('open');
            toggleButton.classList.remove('open');
        }
    });
});

// Add this after your existing code
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('addProblemModal');
    const addProblemBtn = document.getElementById('addProblemBtn');
    const closeModalBtn = document.querySelector('.close-modal');

    // Open modal
    addProblemBtn.addEventListener('click', () => {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // Prevent form submission from closing modal unless successful
    const problemForm = document.getElementById('problemForm');
    problemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await tracker.addProblem();
            modal.classList.remove('open');
            document.body.style.overflow = '';
            problemForm.reset();
        } catch (error) {
            console.error('Failed to add problem:', error);
        }
    });
}); 