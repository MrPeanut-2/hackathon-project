// script.js - NEXUS AI ASSISTANT - Complete Hackathon Version
document.addEventListener('DOMContentLoaded', function() {
    console.log("Nexus loaded");
    
    // Dark Mode Toggle - MOVE THIS CODE HERE
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Only proceed if toggle exists
    if (darkModeToggle) {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        let isDarkMode = false;
        
        // Check for saved preference or system preference
        if (localStorage.getItem('darkMode') === 'enabled' || 
            (localStorage.getItem('darkMode') === null && prefersDarkScheme.matches)) {
            enableDarkMode();
        } else if (localStorage.getItem('darkMode') === 'disabled') {
            disableDarkMode();
        }
        
        // Toggle event listener
        darkModeToggle.addEventListener('click', function() {
            if (isDarkMode) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
            // Add visual feedback
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
        
        function enableDarkMode() {
            document.documentElement.classList.add('dark-mode');
            // Use emoji or SVG - adjust path if needed
            try {
                darkModeToggle.src = './icons/sun.svg';
            } catch (e) {
                // Fallback to emoji if SVG not found
                darkModeToggle.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="%23fbbf24"/></svg>';
            }
            darkModeToggle.title = 'Switch to Light Mode';
            localStorage.setItem('darkMode', 'enabled');
            isDarkMode = true;
            console.log('🌙 Dark mode enabled');
        }
        
        function disableDarkMode() {
            document.documentElement.classList.remove('dark-mode');
            // Use emoji or SVG - adjust path if needed
            try {
                darkModeToggle.src = './icons/moon.svg';
            } catch (e) {
                // Fallback to emoji if SVG not found
                darkModeToggle.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%2394a3b8" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>';
            }
            darkModeToggle.title = 'Toggle Dark Mode';
            localStorage.setItem('darkMode', 'disabled');
            isDarkMode = false;
            console.log('☀️ Light mode enabled');
        }
    } else {
        console.warn('Dark mode toggle button not found!');
    }
    
    // Cache DOM elements
    const input = document.getElementById('main-input');
    const sendButton = document.querySelector('.send-button');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    
    // Gemini API Configuration
	// PLEASE DONT STEAL MY API KEY
	// I DIDNT HAVE TIME TO LEARN BACKEND PLEASEEEE, I BEG YOU, 
	// BE GOOD FOR ONCE
    const GEMINI1 = 'AIzaSyBPw_ecJmH6O';
	const GEMINI3 =	'sVhptammAamy6';
	const GEMINI2 = 'pCrpkL0SU';
    const GEMINI_MODEL = 'gemini-2.5-flash';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI1 + GEMINI3 + GEMINI2}`;
    
    // ... continue with the rest of your original code ...    
// EmailJS Configuration
    const EMAILJS_PUBLIC_KEY = '7i3rOJ6aQCnje4DZY';
    const EMAILJS_SERVICE_ID = 'service_e1dvxam';
    const EMAILJS_TEMPLATE_ID = 'template_ut65n78';
    
    // Rate limit tracking
    let apiCallCount = 0;
    const API_LIMIT_WARNING_THRESHOLD = 5;
    const API_LIMIT_MAX = 15;
    
    // Initialize EmailJS
    let emailjsInitialized = false;
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init({
                publicKey: EMAILJS_PUBLIC_KEY,
                blockHeadless: false,
            });
            emailjsInitialized = true;
            console.log("✅ EmailJS initialized");
        }
    } catch (error) {
        console.warn("EmailJS initialization failed:", error);
    }

    // Email form elements
    const emailForm = document.getElementById('emailForm');
    const overlay = document.getElementById('overlay');
    const cancelEmailBtn = document.getElementById('cancelEmail');
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const emailTo = document.getElementById('emailTo');
    const emailSubject = document.getElementById('emailSubject');
    const emailBody = document.getElementById('emailBody');

    // State
    let currentEmailData = null;
    let waitingForEmailRecipient = false;
    let isProcessing = false;
    let isFirstMessage = true;
    let chatHistory = null;
    let useGeminiAPI = true;

    // Event Listeners
    cancelEmailBtn.addEventListener('click', hideEmailForm);
    sendEmailBtn.addEventListener('click', sendEmailViaEmailJS);
    overlay.addEventListener('click', hideEmailForm);

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = input.value.trim();
            if (message && !isProcessing) {
                handleMessage(message);
            }
        }
    });

    sendButton.addEventListener('click', function() {
        const message = input.value.trim();
        if (message && !isProcessing) {
            handleMessage(message);
        }
    });

    suggestionCards.forEach(card => {
        card.addEventListener('click', function() {
            if (isProcessing) return;
            
            const title = this.querySelector('p:first-child').textContent;
            const desc = this.querySelector('p:last-child').textContent;
            
            if (title.includes("Send an email") || title.includes("email")) {
                input.value = `Send an email about: "${desc}"`;
            } else {
                input.value = `${title}: ${desc}`;
            }
            input.focus();
        });
    });

    // Initialize popup listeners
    setupRateLimitPopupListeners();

    async function handleMessage(message) {
        if (isProcessing) return;
        
        isProcessing = true;
        input.disabled = true;
        sendButton.disabled = true;
        
        try {
            // First time? Switch to chat UI
            if (isFirstMessage) {
                switchToChatUI();
                createChatContainer();
                isFirstMessage = false;
            }

            // Add user message
            addMessage(message, true);
            input.value = '';

            // Check if we're waiting for an email address
            if (waitingForEmailRecipient) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (emailRegex.test(message.trim())) {
                    waitingForEmailRecipient = false;
                    currentEmailData.recipient = message.trim();
                    showEmailForm(currentEmailData);
                    addMessage(`Got it! Email will be sent to ${message.trim()}. Please review and send.`, false);
                    return;
                } else {
                    addMessage("That doesn't look like a valid email address. Please enter a valid email.", false);
                    return;
                }
            }

            // Show thinking indicator
            const thinkingId = showThinkingIndicator();

            try {
                // Check if message is about sending email - BROAD DETECTION
                const lowerMessage = message.toLowerCase();
                console.log("Message analysis:", { 
                    lowerMessage, 
                    hasEmail: lowerMessage.includes('email'), 
                    hasMail: lowerMessage.includes('mail') 
                });
                
                if (lowerMessage.includes('email') || lowerMessage.includes('mail')) {
                    await handleEmailRequest(message, thinkingId);
                } else {
                    // Handle other AI requests with Gemini
                    await handleGeneralAIRequest(message, thinkingId);
                }
            } catch (error) {
                console.error("API Error:", error);
                removeThinkingIndicator(thinkingId);
                // Fallback to mock responses
                handleFallbackResponse(message);
            }
        } finally {
            isProcessing = false;
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
        }
    }

    async function handleEmailRequest(message, thinkingId) {
        if (!useGeminiAPI) {
            removeThinkingIndicator(thinkingId);
            handleMockEmailRequest(message);
            return;
        }

        const prompt = `Extract email details from this request: "${message}"
        
        IMPORTANT: Create a concise, professional subject line (5-7 words max).
        
        Return a valid JSON object with these fields:
        - recipient: email address if mentioned, otherwise "unknown"
        - subject: concise subject line (summarize main topic)
        - body: professional email content (100 words max)
        - action: "send_email"
        
        Example format:
        {
            "recipient": "jerry@example.com",
            "subject": "Meeting Agenda Discussion",
            "body": "Hi Jerry,\\n\\nI wanted to discuss the agenda for our upcoming meeting.\\n\\nNexus AI",
            "action": "send_email"
        }
        
        If recipient is not specified, set recipient to "unknown".
        Return ONLY the JSON object, no other text.`;
        
        try {
            const geminiResponse = await callGeminiAPI(prompt, 15000);
            removeThinkingIndicator(thinkingId);
            
            console.log("Gemini Response (raw):", geminiResponse);
            
            // Clean the response first
            const cleanedResponse = geminiResponse
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .trim();
            
            console.log("Cleaned response:", cleanedResponse);
            
            try {
                // Try to parse directly first
                const emailDetails = JSON.parse(cleanedResponse);
                
                if (emailDetails.action === 'send_email') {
                    if (emailDetails.recipient === 'unknown' || !emailDetails.recipient.includes('@')) {
                        addMessage(`I'll help you send an email. What email address should I send it to?`, false);
                        currentEmailData = emailDetails;
                        waitingForEmailRecipient = true;
                    } else {
                        showEmailForm(emailDetails);
                        addMessage(`I've prepared an email to ${emailDetails.recipient}. Please review and send.`, false);
                    }
                }
            } catch (parseError) {
                console.error("Direct JSON Parse Error:", parseError);
                
                // Fallback: Try to extract JSON from partial response
                const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    console.log("Extracted JSON from partial:", jsonMatch[0]);
                    
                    try {
                        // Try to fix common JSON issues
                        let fixedJson = jsonMatch[0]
                            .replace(/"subject":\s*"([^"]*)$/, '"subject": "$1"')
                            .replace(/"body":\s*"([^"]*)$/, '"body": "$1"')
                            .replace(/,\s*}$/, '}');
                        
                        const emailDetails = JSON.parse(fixedJson);
                        
                        if (emailDetails.action === 'send_email') {
                            if (emailDetails.recipient === 'unknown' || !emailDetails.recipient.includes('@')) {
                                addMessage(`I'll help you send an email. What email address should I send it to?`, false);
                                currentEmailData = emailDetails;
                                waitingForEmailRecipient = true;
                            } else {
                                showEmailForm(emailDetails);
                                addMessage(`I've prepared an email to ${emailDetails.recipient}. Please review and send.`, false);
                            }
                        }
                    } catch (fixError) {
                        console.error("Even fixed JSON failed:", fixError);
                        handleMockEmailRequest(message);
                    }
                } else {
                    console.error("No JSON found even after cleaning");
                    handleMockEmailRequest(message);
                }
            }
        } catch (apiError) {
            console.error("API Error in handleEmailRequest:", apiError);
            removeThinkingIndicator(thinkingId);
            useGeminiAPI = false;
            handleMockEmailRequest(message);
        }
    }

    function handleMockEmailRequest(message) {
        // Create mock email data
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const emailMatch = message.match(emailRegex);
        const recipient = emailMatch ? emailMatch[0] : "unknown";
        
        const nameMatch = message.match(/(?:to|for|dear)\s+([A-Z][a-z]+)/i);
        const name = nameMatch ? nameMatch[1] : '';
        
        const subject = createSmartSubject(message);
        const body = createEmailBody(message, name);
        
        const emailData = {
            recipient: recipient,
            subject: subject,
            body: body,
            action: "send_email"
        };
        
        if (recipient === "unknown") {
            addMessage(`I'll help you send an email. What email address should I send it to?`, false);
            currentEmailData = emailData;
            waitingForEmailRecipient = true;
        } else {
            showEmailForm(emailData);
            addMessage(`I've prepared an email to ${recipient}. Please review and send.`, false);
        }
    }

    async function handleGeneralAIRequest(message, thinkingId) {
        if (!useGeminiAPI) {
            removeThinkingIndicator(thinkingId);
            handleFallbackResponse(message);
            return;
        }

        const prompt = `You are a helpful, friendly AI assistant named "Nexus AI". 
        Respond to this message in a clear, concise way (max 150 words): "${message}"
        
        Be conversational and helpful. If you don't know something, say so honestly.`;
        
        try {
            const response = await callGeminiAPI(prompt, 8000);
            removeThinkingIndicator(thinkingId);
            addMessage(response, false);
        } catch (error) {
            console.error("General AI Request Error:", error);
            removeThinkingIndicator(thinkingId);
            useGeminiAPI = false;
            handleFallbackResponse(message);
        }
    }

    async function callGeminiAPI(prompt, timeout = 15000) {
        console.log("Calling Gemini API...");
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1500,
                        topP: 0.8,
                        topK: 40
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response:", errorText);
                
                if (response.status === 404) {
                    throw new Error(`Model ${GEMINI_MODEL} not found.`);
                }
                
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Increment successful API call counter
            apiCallCount++;
            console.log(`API call count: ${apiCallCount}`);
            
            // Check if we've reached warning threshold
            if (apiCallCount === API_LIMIT_WARNING_THRESHOLD) {
                showRateLimitPopup();
            }
            
            // Check if we've reached hard limit
            if (apiCallCount >= API_LIMIT_MAX) {
                console.log("Hard limit reached, switching to mock mode");
                useGeminiAPI = false;
                showRateLimitPopup(true);
            }
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error("Fetch Error:", error);
            throw error;
        }
    }

    function createSmartSubject(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('meeting')) {
            return "Meeting Discussion";
        } else if (lowerMessage.includes('project')) {
            return "Project Update";
        } else if (lowerMessage.includes('question')) {
            return "Question for You";
        } else if (lowerMessage.includes('urgent')) {
            return "Important: Action Required";
        } else if (lowerMessage.includes('follow up')) {
            return "Follow Up Request";
        } else if (lowerMessage.includes('report')) {
            return "Status Report";
        } else if (lowerMessage.includes('thanks')) {
            return "Thank You Message";
        } else {
            const words = message.split(' ')
                .filter(word => word.length > 3)
                .slice(0, 4)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            return words ? `Regarding: ${words}` : "Message from Nexus AI";
        }
    }

    function createEmailBody(message, name = '') {
        const lowerMessage = message.toLowerCase();
        let greeting = name ? `Hi ${name}` : "Hello";
        let body = "";
        
        if (lowerMessage.includes('meeting')) {
            body = `I wanted to discuss: ${message}\n\nPlease let me know your availability.`;
        } else if (lowerMessage.includes('question')) {
            body = `I have a question: ${message}\n\nCould you please provide some information?`;
        } else if (lowerMessage.includes('thanks')) {
            body = `Thank you for: ${message}\n\nI appreciate it!`;
        } else {
            body = message;
        }
        
        return `${greeting},\n\n${body}\n\nBest regards,\nNexus AI`;
    }

    function handleFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            addMessage("Hello! 👋 I'm Nexus AI. I can help you send emails and answer questions. How can I assist you today?", false);
        } else if (lowerMessage.includes('how are you')) {
            addMessage("I'm doing well, thank you! Ready to help you with anything. What can I do for you?", false);
        } else if (lowerMessage.includes('help')) {
            addMessage("I can help you with sending emails, answering questions, and more. What would you like assistance with?", false);
        } else {
            addMessage(`I understand you're asking about "${message}". I can help you with that!`, false);
        }
    }

    function showEmailForm(emailData) {
        emailTo.value = emailData.recipient || '';
        emailSubject.value = emailData.subject || createSmartSubject(emailData.body || 'Email');
        emailBody.value = emailData.body || '';
        
        emailForm.style.display = 'block';
        overlay.style.display = 'block';
        currentEmailData = emailData;
        
        if (!emailTo.value) {
            emailTo.focus();
        } else if (!emailSubject.value) {
            emailSubject.focus();
        } else {
            emailBody.focus();
        }
    }

    function hideEmailForm() {
        emailForm.style.display = 'none';
        overlay.style.display = 'none';
        currentEmailData = null;
        waitingForEmailRecipient = false;
    }

    async function sendEmailViaEmailJS() {
        if (!emailTo.value.trim()) {
            alert('Please enter a recipient email address');
            emailTo.focus();
            return;
        }

        if (!emailjsInitialized) {
            addMessage(`❌ EmailJS not available. Please check your configuration.`, false);
            return;
        }

        const templateParams = {
            to_email: emailTo.value,
            subject: emailSubject.value || createSmartSubject(emailBody.value),
            message: emailBody.value,
            from_name: 'Nexus AI',
            reply_to: 'noreply@aicompanion.com'
        };

        try {
            sendEmailBtn.textContent = 'Sending...';
            sendEmailBtn.disabled = true;

            console.log("Sending email...");
            
            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams
            );

            console.log("✅ Email sent:", response);
            addMessage(`✅ Email sent successfully to ${emailTo.value}`, false);
            hideEmailForm();
            
        } catch (error) {
            console.error("❌ EmailJS Error:", error);
            
            let errorMessage = "Failed to send email.";
            if (error.text) {
                errorMessage = error.text;
            }
            
            addMessage(`❌ ${errorMessage}`, false);
        } finally {
            sendEmailBtn.textContent = 'Send';
            sendEmailBtn.disabled = false;
        }
    }

    // UI Functions
    function showThinkingIndicator() {
        const thinkingId = 'thinking-' + Date.now();
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message ai-message';
        thinkingDiv.id = thinkingId;
        thinkingDiv.innerHTML = `
            <div class="ai-header">
                <div><img class="ai-icon" src="./icons/logo.jpg"></div>
                <div class="ai-name">Nexus AI</div>
            </div>
            <div class="ai-content" style="color: var(--text-tertiary); font-style: italic;">
                <span class="thinking-dots">Thinking</span>
            </div>
        `;
        
        if (chatHistory) {
            chatHistory.appendChild(thinkingDiv);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
        
        return thinkingId;
    }

    function removeThinkingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    function switchToChatUI() {
        const welcomeHeader = document.querySelector('.welcome-header');
        const suggestedDiv = document.querySelector('.suggested-div');
        
        if (welcomeHeader) welcomeHeader.style.display = 'none';
        if (suggestedDiv) suggestedDiv.style.display = 'none';
        
        const container = document.querySelector('.container');
        if (container) container.style.marginTop = '40px';
        
        moveInputToBottom();
    }

    function createChatContainer() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.innerHTML = `
            <div class="chat-history" id="chatHistory">
                <!-- Messages will be inserted here -->
            </div>
        `;

        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(chatContainer, container.firstChild);
            chatHistory = document.getElementById('chatHistory');
        }
    }

    function addMessage(text, isUser = true) {
        if (!chatHistory) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        if (isUser) {
            messageDiv.textContent = text;
        } else {
            const formattedText = text
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            messageDiv.innerHTML = `
                <div class="ai-header">
                    <div><img class="ai-icon" src="./icons/logo.jpg"></div>
                    <div class="ai-name">Nexus AI</div>
                </div>
                <div class="ai-content">${formattedText}</div>
            `;
        }
        
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function moveInputToBottom() {
        const inputContainer = document.querySelector('.input-container');
        const container = document.querySelector('.container');

        if (!inputContainer || inputContainer.style.position === 'fixed') return;

        inputContainer.remove();
        document.body.appendChild(inputContainer);

        inputContainer.style.position = 'fixed';
        inputContainer.style.bottom = '20px';
        inputContainer.style.left = '50%';
        inputContainer.style.transform = 'translateX(-50%)';
        inputContainer.style.width = '768px';
        inputContainer.style.maxWidth = '90%';
        inputContainer.style.zIndex = '1000';
        inputContainer.style.background = 'var(--bg-primary)';
        inputContainer.style.padding = '15px';
        inputContainer.style.borderRadius = '25px';
        inputContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        inputContainer.style.border = 'none';

        const inputBox = inputContainer.querySelector('.input-box');
        if (inputBox) {
            inputBox.style.padding = '15px';
            inputBox.style.width = '100%';
            inputBox.style.border = 'none';
            inputBox.style.boxShadow = 'none';
        }

        inputContainer.style.transition = 'all 0.3s ease';
        if (container) {
            container.style.paddingBottom = '120px';
        }
    }
    
    // Rate Limit Popup Functions
    function showRateLimitPopup(isHardLimit = false) {
        const popup = document.getElementById('rateLimitPopup');
        const overlay = document.getElementById('rateLimitOverlay');
        const callCountSpan = document.getElementById('callCount');
        const message = document.getElementById('popupMessage');
        
        callCountSpan.textContent = apiCallCount;
        
        if (isHardLimit) {
            message.innerHTML = `<strong>Maximum API calls (${API_LIMIT_MAX}) reached.</strong><br><br>
                                Automatically switching to mock mode for testing.`;
            document.getElementById('continueApiBtn').style.display = 'none';
        } else {
            message.innerHTML = `You've made <strong>${apiCallCount} API calls</strong>. The free tier has strict limits (~50-100 calls/day).<br><br>
                                Switch to mock mode for unlimited testing?`;
            document.getElementById('continueApiBtn').style.display = 'block';
        }
        
        popup.style.display = 'block';
        overlay.style.display = 'block';
    }

    function hideRateLimitPopup() {
        document.getElementById('rateLimitPopup').style.display = 'none';
        document.getElementById('rateLimitOverlay').style.display = 'none';
    }

    function setupRateLimitPopupListeners() {
        // Create popup elements if they don't exist
        if (!document.getElementById('rateLimitPopup')) {
            createRateLimitPopupElements();
        }
        
        document.getElementById('continueApiBtn').addEventListener('click', function() {
            console.log("User chose to continue with real API");
            hideRateLimitPopup();
        });
        
        document.getElementById('switchToMockBtn').addEventListener('click', function() {
            console.log("User switched to mock mode");
            useGeminiAPI = false;
            addMessage("Switched to mock mode for testing. Responses will be simulated.", false);
            hideRateLimitPopup();
        });
        
        document.getElementById('dismissPopupBtn').addEventListener('click', function() {
            hideRateLimitPopup();
        });
        
        document.getElementById('rateLimitOverlay').addEventListener('click', hideRateLimitPopup);
    }
    
    function createRateLimitPopupElements() {
        // Create popup HTML
        const popupHTML = `
            <div id="rateLimitPopup" class="rate-limit-popup" style="display: none;">
                <h3>API Usage Alert ⚠️</h3>
                <p id="popupMessage">You've made <span id="callCount">5</span> API calls. Free tier limits are strict.</p>
                <div class="popup-buttons">
                    <button id="continueApiBtn" class="btn-primary">Continue with Real API</button>
                    <button id="switchToMockBtn" class="btn-secondary">Switch to Mock Mode (Testing)</button>
                    <button id="dismissPopupBtn" class="btn-tertiary">Dismiss</button>
                </div>
            </div>
            <div id="rateLimitOverlay" class="rate-limit-overlay" style="display: none;"></div>
        `;
        
        // Add to body
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // Add CSS for popup
        const style = document.createElement('style');
        style.textContent = `
            .rate-limit-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-primary);
                padding: 25px;
                border-radius: var(--radius-lg);
                z-index: 2000;
                box-shadow: var(--shadow-lg);
                width: 400px;
                max-width: 90%;
                border: 1px solid var(--border-light);
            }
            
            .rate-limit-popup h3 {
                margin-bottom: 15px;
                color: var(--text-primary);
                font-size: 18px;
                font-weight: 600;
            }
            
            .rate-limit-popup p {
                margin-bottom: 20px;
                color: var(--text-secondary);
                line-height: 1.5;
            }
            
            .popup-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .btn-primary, .btn-secondary, .btn-tertiary {
                padding: 12px;
                border-radius: var(--radius-md);
                font-weight: 500;
                cursor: pointer;
                font-family: var(--font-family);
                font-size: 14px;
                transition: all 0.15s ease;
            }
            
            .btn-primary {
                background: var(--accent);
                color: white;
                border: none;
            }
            
            .btn-primary:hover {
                background: var(--accent-hover);
            }
            
            .btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-secondary);
                border: 1px solid var(--border-light);
            }
            
            .btn-secondary:hover {
                background: var(--bg-secondary);
                border-color: var(--border);
            }
            
            .btn-tertiary {
                background: transparent;
                color: var(--text-tertiary);
                border: none;
            }
            
            .btn-tertiary:hover {
                color: var(--text-secondary);
            }
            
            .rate-limit-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 1999;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add CSS for thinking animation and messages
    const style = document.createElement('style');
    style.textContent = `
        .thinking-dots::after {
            content: '';
            animation: dots 1.5s steps(4, end) infinite;
        }
        
        @keyframes dots {
            0%, 20% { content: ''; }
            40% { content: '.'; }
            60% { content: '..'; }
            80%, 100% { content: '...'; }
        }
        
        input:disabled, button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .message {
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .user-message {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border: none;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            max-width: 70%;
            margin-left: auto;
            margin-right: 0;
            padding: 10px 16px;
            border-radius: 18px;
            border-bottom-right-radius: 4px;
        }
        
        .ai-message {
            width: 100%;
            margin-right: auto;
            background: transparent;
        }
        
        .ai-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }
        
        .ai-icon {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            border: 1px solid gray;
        }
        
        .ai-name {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 14px;
        }
        
        .ai-content {
            color: var(--text-primary);
            padding: 8px 0 8px 32px;
            font-size: 14px;
            line-height: 1.5;
            background: transparent;
        }
    `;
    document.head.appendChild(style);
});

// Add popup for non-functional buttons
const actionButtons = document.querySelectorAll('.input-actions');
actionButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        showFeatureComingPopup();
    });
});

// Feature Coming Soon Popup Functions
function showFeatureComingPopup() {
    // Create popup elements if they don't exist
    if (!document.getElementById('featurePopup')) {
        createFeaturePopup();
    }

    document.getElementById('featurePopup').style.display = 'block';
    document.getElementById('featureOverlay').style.display = 'block';
}

function hideFeaturePopup() {
    document.getElementById('featurePopup').style.display = 'none';
    document.getElementById('featureOverlay').style.display = 'none';
}

function createFeaturePopup() {
    // Create popup HTML
    const popupHTML = `
        <div id="featurePopup" class="feature-popup" style="display: none;">
            <h3>🚧 Feature Coming Soon</h3>
            <p>This button is here for show! With better API request handling (like higher rate limits or WebSocket support), we could implement this feature.</p>
            <p><em>Sadly, free tier restrictions limit what we can demo today.</em></p>
            <button id="closeFeaturePopup" class="btn-primary">Close Popup</button>
        </div>
        <div id="featureOverlay" class="modal-overlay" style="display: none;"></div>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Add event listener
    document.getElementById('closeFeaturePopup').addEventListener('click', hideFeaturePopup);
    document.getElementById('featureOverlay').addEventListener('click', hideFeaturePopup);

    // Add CSS for feature popup
    const style = document.createElement('style');
    style.textContent = `
        .feature-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-primary);
            padding: 25px;
            border-radius: var(--radius-lg);
            z-index: 1001;
            box-shadow: var(--shadow-lg);
            width: 400px;
            max-width: 90%;
            border: 1px solid var(--border-light);
            text-align: center;
        }

        .feature-popup h3 {
            margin-bottom: 15px;
            color: var(--text-primary);
            font-size: 18px;
            font-weight: 600;
        }

        .feature-popup p {
            margin-bottom: 15px;
            color: var(--text-secondary);
            line-height: 1.5;
            font-size: 14px;
        }

        .feature-popup p em {
            color: var(--text-tertiary);
            font-size: 13px;
        }

        #closeFeaturePopup {
            margin-top: 10px;
            width: 100%;
        }
    `;
    document.head.appendChild(style);
}
