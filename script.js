// script.js
document.addEventListener('DOMContentLoaded', function() {
    const input = document.querySelector('input');
    const sendButton = document.querySelector('.send-button');
    const suggestionCards = document.querySelectorAll('.suggestion-card');

    // Enter to send
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = input.value.trim();
            if (message) {
                handleMessage(message);
            }
        }
    });

    // Click to send
    sendButton.addEventListener('click', function() {
        const message = input.value.trim();
        if (message) {
            handleMessage(message);
        }
    });

    // Suggestions
    suggestionCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('p:first-child').textContent;
            const desc = this.querySelector('p:last-child').textContent;
            input.value = `${title} - ${desc}`;
            input.focus();
        });
    });

    function handleMessage(message) {
        // First time? Switch to chat UI
        if (!document.getElementById('chatHistory')) {
            switchToChatUI();
            createChatContainer();
        }

        // Add user message
        addMessage(message, true);
        input.value = '';

        // Add AI response (fake for now)
        setTimeout(() => {
            addMessage("I've applied dark mode with larger text to the current page. The styles will persist on your next visit.", false);
        }, 500);
    }

function switchToChatUI() {
    console.log('Switching to chat UI...');
    
    // Hide these elements
    const welcomeHeader = document.querySelector('.welcome-header');
    const suggestedDiv = document.querySelector('.suggested-div');
    
    if (welcomeHeader) welcomeHeader.style.display = 'none';
    if (suggestedDiv) suggestedDiv.style.display = 'none';
    
    // Adjust container position
    const container = document.querySelector('.container');
    container.style.marginTop = '40px'; // Less margin since input will be at bottom
    
    // Move the existing input container to bottom
    moveInputToBottom();
}
    function createChatContainer() {
        console.log('Creating chat container...');
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.innerHTML = `
            <div class="chat-history" id="chatHistory">
                <!-- Messages will be inserted here -->
            </div>
        `;

        // Insert at the top of container
        const container = document.querySelector('.container');
        container.insertBefore(chatContainer, container.firstChild);
    }

    function addMessage(text, isUser = true) {
        console.log('Adding message:', text, isUser);
        const chatHistory = document.getElementById('chatHistory');
        if (!chatHistory) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        if (isUser) {
            messageDiv.textContent = text;
        } else {
            messageDiv.innerHTML = `
                <div class="ai-header">
                    <div class="ai-icon">AI</div>
                    <div class="ai-name">Smart Companion</div>
                </div>
                <div class="ai-content">${text}</div>
            `;
        }
        
        // Add to BOTTOM (appendChild)
        chatHistory.appendChild(messageDiv);
        
        // Scroll to bottom to see new message
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
function moveInputToBottom() {
    const inputContainer = document.querySelector('.input-container');
    const container = document.querySelector('.container');

    // If already moved, do nothing
    if (inputContainer.style.position === 'fixed') return;

    // Remove from its current position in DOM
    inputContainer.remove();

    // Add to body as direct child (for fixed positioning)
    document.body.appendChild(inputContainer);

    // Style it for bottom positioning
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
    inputContainer.style.border = 'none'; // ← REMOVE BORDER HERE

    // Make the input box transparent
    const inputBox = inputContainer.querySelector('.input-box');
    inputBox.style.padding = '15px';
    inputBox.style.width = '100%';
    inputBox.style.border = 'none'; // ← REMOVE INPUT BOX BORDER
    inputBox.style.boxShadow = 'none'; // ← REMOVE BOX SHADOW

    // Add transition for smooth movement
    inputContainer.style.transition = 'all 0.3s ease';

    // Adjust container bottom padding since input is now fixed
    container.style.paddingBottom = '100px';
}
});
