// script.js - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const input = document.getElementById('main-input');
    const sendButton = document.querySelector('.send-button');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    
    // EmailJS setup
    emailjs.init('7i3rOJ6aQCnje4DZY');
    const EMAILJS_SERVICE_ID = 'service_e1dvxam';
    const EMAILJS_TEMPLATE_ID = 'template_ut65n78';
    
    // Gemini API configuration
    const GEMINI_API_KEY = 'AIzaSyAfEdltX4Xh0Y4ksi9WSUA3jg8aH6WZ17o';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

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

    // Email form handlers
    cancelEmailBtn.addEventListener('click', hideEmailForm);
    sendEmailBtn.addEventListener('click', sendEmailViaEmailJS);
    overlay.addEventListener('click', hideEmailForm);

    // Enter to send
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = input.value.trim();
            if (message && !isProcessing) {
                handleMessage(message);
            }
        }
    });

    // Click to send
    sendButton.addEventListener('click', function() {
        const message = input.value.trim();
        if (message && !isProcessing) {
            handleMessage(message);
        }
    });

    // Suggestions
    suggestionCards.forEach(card => {
        card.addEventListener('click', function() {
            if (isProcessing) return;
            
            const title = this.querySelector('p:first-child').textContent;
            const desc = this.querySelector('p:last-child').textContent;
            
            if (title.includes("Send an email") || title.includes("email")) {
                input.value = `Send an email to Jerry about: "${desc}"`;
            } else {
                input.value = `${title} - ${desc}`;
            }
            input.focus();
        });
    });

    async function handleMessage(message) {
        if (isProcessing) return;
        
        isProcessing = true;
        input.disabled = true;
        sendButton.disabled = true;
        
        try {
            // First time? Switch to chat UI
            if (!document.getElementById('chatHistory')) {
                switchToChatUI();
                createChatContainer();
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
                // Check if message is about sending email
                if (message.toLowerCase().includes('send') && 
                    (message.toLowerCase().includes('email') || 
                     message.toLowerCase().includes('mail'))) {
                    
                    await handleEmailRequest(message, thinkingId);
                } else {
                    // Handle other AI requests with Gemini
                    await handleGeneralAIRequest(message, thinkingId);
                }
            } catch (error) {
                removeThinkingIndicator(thinkingId);
                addMessage("Sorry, I encountered an error. Please try again.", false);
            }
        } finally {
            isProcessing = false;
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
        }
    }

    async function handleEmailRequest(message, thinkingId) {
        const prompt = `Extract email details from this request: "${message}"
        
        Return a JSON object with:
        - recipient: email address if mentioned, otherwise "unknown"
        - subject: email subject line (max 10 words)
        - body: email content (max 100 words)
        - action: "send_email" or "draft_only"
        
        If recipient is not specified, set recipient to "unknown".
        Format your response as valid JSON only.`;
        
        try {
            const geminiResponse = await callGeminiAPI(prompt, 5000);
            removeThinkingIndicator(thinkingId);
            
            try {
                const emailDetails = JSON.parse(geminiResponse);
                
                if (emailDetails.action === 'send_email') {
                    if (emailDetails.recipient === 'unknown') {
                        addMessage(`I'll help you send an email. What email address should I send it to?`, false);
                        currentEmailData = emailDetails;
                        waitingForEmailRecipient = true;
                    } else {
                        showEmailForm(emailDetails);
                        addMessage(`I've prepared an email to ${emailDetails.recipient}. Please review and send.`, false);
                    }
                } else {
                    addMessage(`Here's a draft email:\n\nTo: ${emailDetails.recipient || 'Recipient'}\nSubject: ${emailDetails.subject}\n\n${emailDetails.body}`, false);
                }
            } catch (parseError) {
                removeThinkingIndicator(thinkingId);
                showEmailForm({
                    recipient: '',
                    subject: `Regarding: ${message.substring(0, 30)}...`,
                    body: `Hello,\n\n${message}\n\nBest regards,\nAI Companion`
                });
                addMessage("I'll help you send that email. Please fill in the details.", false);
            }
        } catch (apiError) {
            removeThinkingIndicator(thinkingId);
            showEmailForm({
                recipient: '',
                subject: `Regarding: ${message.substring(0, 30)}...`,
                body: `Hello,\n\n${message}\n\nBest regards,\nAI Companion`
            });
            addMessage("I'll help you send that email. Please fill in the details.", false);
        }
    }

    async function handleGeneralAIRequest(message, thinkingId) {
        const prompt = `You are a helpful AI assistant. Give a concise response to: "${message}" (max 150 words)`;
        try {
            const response = await callGeminiAPI(prompt, 5000);
            removeThinkingIndicator(thinkingId);
            addMessage(response, false);
        } catch (error) {
            removeThinkingIndicator(thinkingId);
            const fallbackResponses = [
                "I understand you're asking about: " + message + ". Could you provide a bit more detail?",
                "Thanks for your question about " + message + ". I'm here to help!",
                "I can help with " + message + ". What specific aspect would you like to know about?"
            ];
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            addMessage(randomResponse, false);
        }
    }

    async function callGeminiAPI(prompt, timeout = 10000) {
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
                    }]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response from Gemini API');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (prompt.includes('email')) {
                return JSON.stringify({
                    recipient: "unknown",
                    subject: "Follow up from our conversation",
                    body: "Hello,\n\nThis is regarding our recent conversation.\n\nBest regards,\nAI Companion",
                    action: "send_email"
                });
            }
            
            throw error;
        }
    }

    function showEmailForm(emailData) {
        emailTo.value = emailData.recipient || '';
        emailSubject.value = emailData.subject || '';
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

        const templateParams = {
            to_email: emailTo.value,
            subject: emailSubject.value,
            message: emailBody.value,
            from_name: 'AI Companion',
            reply_to: 'noreply@aicompanion.com'
        };

        try {
            const originalText = sendEmailBtn.textContent;
            sendEmailBtn.textContent = 'Sending...';
            sendEmailBtn.disabled = true;

            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams
            );

            addMessage(`✅ Email sent successfully to ${emailTo.value}`, false);
            hideEmailForm();
            
            sendEmailBtn.textContent = originalText;
            sendEmailBtn.disabled = false;

        } catch (error) {
            addMessage(`❌ Failed to send email: ${error.text || 'Unknown error'}`, false);
            
            sendEmailBtn.textContent = 'Send';
            sendEmailBtn.disabled = false;
        }
    }

    function showThinkingIndicator() {
        const thinkingId = 'thinking-' + Date.now();
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message ai-message';
        thinkingDiv.id = thinkingId;
        thinkingDiv.innerHTML = `
            <div class="ai-header">
                <div class="ai-icon">AI</div>
                <div class="ai-name">Smart Companion</div>
            </div>
            <div class="ai-content" style="color: var(--text-tertiary); font-style: italic;">
                <span class="thinking-dots">Thinking</span>
            </div>
        `;
        
        const chatHistory = document.getElementById('chatHistory');
        if (chatHistory) {
            chatHistory.appendChild(thinkingDiv);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
        
        return thinkingId;
    }

    function removeThinkingIndicator(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
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
        }
    }

    function addMessage(text, isUser = true) {
        const chatHistory = document.getElementById('chatHistory');
        if (!chatHistory) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        if (isUser) {
            messageDiv.textContent = text;
        } else {
            const formattedText = text.replace(/\n/g, '<br>');
            messageDiv.innerHTML = `
                <div class="ai-header">
                    <div class="ai-icon">AI</div>
                    <div class="ai-name">Smart Companion</div>
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
            container.style.paddingBottom = '100px';
        }
    }
    
    // Add CSS for thinking animation
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
    `;
    document.head.appendChild(style);
});
