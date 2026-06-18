// State
let userProfile = {
    transport: '',
    diet: '',
    energy: '',
    footprint: {
        transport: 0,
        diet: 0,
        energy: 0,
        total: 0
    }
};

let footprintChartInstance = null;

// DOM Elements
const onboardingSection = document.getElementById('onboarding');
const dashboardSection = document.getElementById('dashboard');
const onboardingForm = document.getElementById('onboarding-form');
const totalCo2El = document.getElementById('total-co2');
const kpiComparisonEl = document.getElementById('kpi-comparison');
const recalculateBtn = document.getElementById('recalculate-btn');

const apiKeySection = document.getElementById('api-key-section');
const apiKeyInput = document.getElementById('groq-api-key');
const fetchInsightsBtn = document.getElementById('fetch-insights-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const aiResults = document.getElementById('ai-results');
const actionList = document.getElementById('action-list');

// Constants for rough estimation (in Tons of CO2 per year)
const EMISSION_FACTORS = {
    transport: {
        car_gas: 4.6,
        car_ev: 1.5,
        public: 1.0,
        bike_walk: 0.0
    },
    diet: {
        meat_heavy: 3.3,
        average: 2.5,
        vegetarian: 1.7,
        vegan: 1.5
    },
    energy: {
        grid_standard: 5.0,
        mixed: 3.5,
        renewable: 0.5
    }
};

// Event Listeners
onboardingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    userProfile.transport = document.getElementById('transport').value;
    userProfile.diet = document.getElementById('diet').value;
    userProfile.energy = document.getElementById('energy').value;

    calculateFootprint();
    transitionToDashboard();
});

recalculateBtn.addEventListener('click', () => {
    dashboardSection.classList.add('hidden');
    onboardingSection.classList.remove('hidden');
    // Reset AI state
    aiResults.classList.add('hidden');
    apiKeySection.classList.remove('hidden');
});

fetchInsightsBtn.addEventListener('click', fetchGroqInsights);

// Core Logic
function calculateFootprint() {
    userProfile.footprint.transport = EMISSION_FACTORS.transport[userProfile.transport];
    userProfile.footprint.diet = EMISSION_FACTORS.diet[userProfile.diet];
    userProfile.footprint.energy = EMISSION_FACTORS.energy[userProfile.energy];
    
    userProfile.footprint.total = 
        userProfile.footprint.transport + 
        userProfile.footprint.diet + 
        userProfile.footprint.energy;
}

function transitionToDashboard() {
    onboardingSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    
    // Update KPI
    const totalStr = userProfile.footprint.total.toFixed(1);
    totalCo2El.innerText = totalStr;

    // Compare to average (approx 16 tons for US, 4.5 global)
    const avg = 16.0;
    if (userProfile.footprint.total < avg) {
        const percent = Math.round((1 - (userProfile.footprint.total / avg)) * 100);
        kpiComparisonEl.innerText = `You produce ${percent}% less CO₂ than the average American.`;
        kpiComparisonEl.style.color = 'var(--primary)';
    } else {
        kpiComparisonEl.innerText = `Your footprint is above average. Let's fix that!`;
        kpiComparisonEl.style.color = 'var(--warning)';
    }

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('footprintChart').getContext('2d');
    
    if (footprintChartInstance) {
        footprintChartInstance.destroy();
    }

    footprintChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Transport', 'Diet', 'Home Energy'],
            datasets: [{
                data: [
                    userProfile.footprint.transport, 
                    userProfile.footprint.diet, 
                    userProfile.footprint.energy
                ],
                backgroundColor: [
                    '#3b82f6', // blue
                    '#10b981', // green
                    '#f59e0b'  // yellow
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8fafc' }
                }
            }
        }
    });
}

async function fetchGroqInsights() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert("Please enter a valid Groq API Key.");
        return;
    }

    apiKeySection.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    const prompt = `You are an expert environmental consultant. 
    The user has an estimated annual carbon footprint of ${userProfile.footprint.total.toFixed(1)} tons.
    Their primary transport is: ${userProfile.transport.replace('_', ' ')} (${userProfile.footprint.transport} tons).
    Their diet is: ${userProfile.diet.replace('_', ' ')} (${userProfile.footprint.diet} tons).
    Their home energy source is: ${userProfile.energy.replace('_', ' ')} (${userProfile.footprint.energy} tons).
    
    Provide exactly 3 simple, highly personalized, and actionable steps they can take to reduce their footprint right now.
    Format your response as a valid JSON array of objects. Do not wrap it in markdown block quotes. Just the raw JSON.
    Example format:
    [
      {"title": "Action Title", "description": "Short explanation of how this helps."}
    ]`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Parse the JSON array from the response
        const actions = JSON.parse(content);
        displayAIResults(actions);

    } catch (error) {
        console.error(error);
        alert("Failed to fetch insights. Please check your API key and try again.");
        apiKeySection.classList.remove('hidden');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function displayAIResults(actions) {
    actionList.innerHTML = '';
    
    actions.forEach(action => {
        const li = document.createElement('li');
        li.className = 'action-item';
        li.innerHTML = `
            <div class="action-title">${action.title}</div>
            <div class="action-desc">${action.description}</div>
        `;
        actionList.appendChild(li);
    });

    aiResults.classList.remove('hidden');
}
