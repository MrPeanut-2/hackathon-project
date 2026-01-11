# Nexus AI
Nexus AI - Email Assistant & Chatbot

https://github.com/MrPeanut-2/hackathon-project/edit/main/screenshot.png
📋 Overview

Nexus AI is a modern web application that combines AI-powered email assistance with a conversational chatbot interface. It helps users draft and send emails efficiently while providing helpful responses to various queries.
✨ Features
🎯 Core Functionality
    Smart Email Drafting: Automatically generates email subjects and content based on user requests
    Email Integration: Seamlessly sends emails using EmailJS service
    Conversational AI: Provides helpful responses to user questions
    Clean UI: Modern, minimalist interface inspired by OpenWebUI design principles

🎨 User Interface
    Responsive Design: Works perfectly on desktop and mobile devices
    Real-time Chat: Interactive chat interface with message history
    Smart Suggestions: Pre-built templates for common tasks
    Email Preview: Popup form for reviewing and editing emails before sending

🚀 Technical Features
    Client-side Processing: No server required for basic functionality
    Mock AI System: Works offline with intelligent fallback responses
    EmailJS Integration: Real email sending capability
    Modern CSS: Custom properties, animations, and smooth transitions

🛠️ Tech Stack

    Frontend: HTML5, CSS3, JavaScript (ES6+)
    Email Service: EmailJS
    Icons: SVG icons
    Font: Inter from Google Fonts
    No External Dependencies: Pure vanilla JavaScript implementation

📁 Project Structure
text

AI-Companion/
├── index.html          # Main HTML file
├── style.css          # All CSS styles
├── script.js          # Main JavaScript application
├── icons/             # SVG icons directory
│   ├── logo.svg
│   ├── send.svg
│   ├── add.svg
│   ├── boxes.svg
│   ├── voice.svg
│   ├── filter.svg
│   └── person.svg
└── README.md          # This file

🚀 Getting Started
Prerequisites
    A modern web browser (Chrome, Firefox, Safari, Edge)
    An EmailJS account (for actual email sending)

Installation

    Clone the repository
    bash

git clone https://github.com/MrPeanut-2/hackathon-project.git
cd hackathon-project

Open the application
    Simply open index.html in your browser
    Or use a local server:
    bash

# Using Python
python -m http.server 8000

# Using Node.js
npx serve

    Configure EmailJS (Optional for real email sending)
        Sign up at EmailJS
        Get your Service ID and Template ID
        Update the script.js file with your credentials

Using EmailJS

To enable actual email sending:
    Create a free account at EmailJS
    Create a service and template
    Update the following variables in script.js:
    javascript

const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';

    Initialize EmailJS with your public key

🎮 How to Use
1. Starting a Conversation
    Type any message in the input box and press Enter or click Send
    Try greetings like "hello" or "how are you"

2. Sending Emails
    Say "send an email to [name] about [topic]"
    The AI will generate a draft with subject and body
    Fill in the recipient email when prompted
    Review and send from the popup form

3. Using Suggestions
Click on any suggestion card to pre-fill the input:
    "Help me study" - Get study tips and vocabulary help
    "Send an email to Jerry" - Start an email draft
    "Give me ideas" - Creative suggestions for various tasks
    
4. Asking Questions
The AI can answer various questions:
    "capital of france"
    "what can you do"
    "help me with studying"
    Any general knowledge questions

🔧 Configuration
Customizing Responses

Edit the getSmartResponse() function in script.js to add custom responses:
javascript

function getSmartResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Add your custom responses here
    if (lowerMessage.includes('your_custom_keyword')) {
        return "Your custom response here";
    }
    // ... existing code
}

Styling

Modify CSS variables in style.css to change the theme:
css

:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --accent: #3b82f6;
    --text-primary: #1e293b;
    /* ... other variables */
}

📱 Responsive Design

The application is fully responsive:
    Desktop: Optimized for screens > 768px
    Tablet: Responsive layout adjustments
    Mobile: Single column layout with touch-friendly buttons

🔄 Workflow
    Initial State: Clean landing page with suggestions
    First Message: Transitions to chat interface
    Email Request: Detects email-related queries
    Draft Generation: Creates email content
    Recipient Input: Asks for email address if not provided
    Review & Send: Shows popup form for final editing
    Confirmation: Shows success message

🧠 Mock AI System

Since the Gemini API requires authentication, this project includes a sophisticated mock AI system that:
    Provides intelligent responses to common questions
    Generates context-aware email drafts
    Understands natural language requests
    Works completely offline

Adding Real AI Integration

To add real AI (Gemini API):
    Get an API key from Google AI Studio
    Uncomment and configure the Gemini API section in script.js
    Remove the useMockAPI = true flag

🐛 Troubleshooting
Common Issues
    Emails not sending
        Check EmailJS configuration
        Verify internet connection
        Check browser console for errors
    
    Layout issues
        Clear browser cache
        Check for CSS conflicts
        Verify all icons are in the icons folder

    JavaScript errors
        Open browser console (F12)
        Check for syntax errors
        Verify file paths

Debug Mode

Enable console logging by ensuring console.log statements are not commented out in script.js.
📝 License

This project is available as open source under the terms of the MIT License.
🤝 Contributing
    Fork the repository
    Create a feature branch (git checkout -b feature/AmazingFeature)
    Commit your changes (git commit -m 'Add some AmazingFeature')
    Push to the branch (git push origin feature/AmazingFeature)
    Open a Pull Request

🙏 Acknowledgments
    Design inspired by OpenWebUI
    Icons from various open source icon sets
    EmailJS for email service integration
    Google Fonts for the Inter typeface

📞 Support

For support, questions, or feedback:

    Open an issue in the GitHub repository

    Check the FAQ section (coming soon)
