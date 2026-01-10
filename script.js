console.log("AI Study Assistant Loaded!");

// Mock responses for demo (replace with real Gemini API)
const mockResponses = {
    quiz: `📝 **Quiz Questions Generated:**

1. What is the primary function of photosynthesis?
2. Where in the plant cell does photosynthesis occur?
3. What important gas is released as a byproduct?

**Answers:**
1. To convert sunlight into chemical energy
2. In the chloroplasts
3. Oxygen

💡 *Tip: Try pasting your own text for personalized quizzes!*`,

    summary: `📄 **Summary:**
    
Photosynthesis is the biological process where plants transform sunlight into usable chemical energy. This occurs specifically within chloroplasts and results in oxygen production.

🎯 **Key Point:** This process is fundamental to life on Earth, providing both energy for plants and oxygen for animals.`,

    explain: `💡 **Simple Explanation:**
    
Think of plants as nature's solar panels! They take:
• ☀️ Sunlight (energy)
• 💧 Water (from roots)
• 🌬️ Carbon dioxide (from air)

And turn it into:
• 🍃 Food for themselves (glucose)
• 🌬️ Oxygen for us to breathe

It's like a tiny food factory inside every green leaf!`
};

// DOM Elements
const inputText = document.getElementById('inputText');
const output = document.getElementById('output');
const loading = document.getElementById('loading');

// Button Functions
function generateQuiz() {
    showLoading();
    setTimeout(() => {
        output.innerHTML = mockResponses.quiz;
        hideLoading();
        addGeminiCredit();
    }, 800);
}

function summarize() {
    showLoading();
    setTimeout(() => {
        output.innerHTML = mockResponses.summary;
        hideLoading();
        addGeminiCredit();
    }, 600);
}

function explain() {
    showLoading();
    setTimeout(() => {
        output.innerHTML = mockResponses.explain;
        hideLoading();
        addGeminiCredit();
    }, 500);
}

function clearText() {
    inputText.value = '';
    output.innerHTML = 'Click a button above to see AI magic in action!';
}

// UI Helpers
function showLoading() {
    loading.style.display = 'block';
    output.style.opacity = '0.5';
}

function hideLoading() {
    loading.style.display = 'none';
    output.style.opacity = '1';
}

function addGeminiCredit() {
    output.innerHTML += '\n\n---\n*Powered by Google Gemini AI*';
}

// Real Gemini API integration (TODO: Add your API key)
async function callGeminiAPI(prompt) {
    // Get API key from organizers
    const API_KEY = "YOUR_API_KEY_HERE";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("API Error:", error);
        return "⚠️ Connect real Gemini API for full functionality!";
    }
}

// Make functions available globally
window.generateQuiz = generateQuiz;
window.summarize = summarize;
window.explain = explain;
window.clearText = clearText;
window.callGeminiAPI = callGeminiAPI;
