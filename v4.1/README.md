# AI Auto Fill Chrome Extension

## Overview

This Chrome extension adds a smart AI assistant to input fields on websites. It offers four powerful AI features: Auto Fill, Ask AI, Content Enhancement, and Floating Chatbox, allowing you to automatically generate or improve content for any form field and have general conversations with AI.

## Images

![AI Auto Fill Extension Screenshot](./images/ss_1.png)

## Features

- **Auto Fill**: Instantly generates appropriate content for any field based on context (Alt+A)
- **Ask AI**: Ask the AI to generate specific content with your own custom prompt (Alt+Q)
- **Content Enhancement**: Improve existing text with AI-powered enhancements (Alt+E)
- **Floating Chatbox**: Open a moveable floating window for general AI conversations with selected text context
- Sleek capsule-shaped UI that appears when you focus on an input field
- Keyboard shortcuts for faster workflow
- Supports multiple AI providers (Gemini, OpenAI, Claude)
- Configurable AI models for each provider
- Contextual content generation based on field type and form purpose
- Loading animations and tooltips for improved user experience
- User-friendly error handling and feedback
- Modern, elegant, rounded design for the floating chatbox with glassmorphism effects
- Draggable and resizable floating chatbox window with boundary constraints
- Persistent chat history with local storage
- **Selected Text Context**: Automatically detects selected text from web pages and uses it as context in AI conversations
- Minimize/maximize chatbox functionality
- Always stays accessible while browsing

## Installation

<!-- ### From Chrome Web Store

1. Visit the [AI Auto Fill Assistant](https://chrome.google.com/webstore/detail/ai-auto-fill-assistant/your-extension-id) on Chrome Web Store
2. Click "Add to Chrome"
3. The extension will be installed and ready to use -->

### Development Mode

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and ready to use

## Configuration

1. Click on the extension icon in the Chrome toolbar
2. Select your preferred AI provider
3. Enter your API key for the selected provider
4. Choose the AI model you want to use
5. Click "Save Settings"

## Usage

### Auto Fill

1. Click into any input field on a webpage
2. The AI buttons will appear on the right side of the field
3. Click the purple magic wand button to automatically generate content (or use keyboard shortcut Alt+A)
4. The field will be filled with AI-generated content

### Ask AI

1. Click into any input field
2. Click the green chat bubble button (or use keyboard shortcut Alt+Q)
3. Enter your specific request or prompt in the popup
4. Press Enter to generate customized content

### Content Enhancement

1. Write or paste some text into an input field
2. Click the blue enhancement button (or use keyboard shortcut Alt+E) - only active when field has content
3. The AI will improve your text while maintaining its original meaning

### Floating Chatbox

1. Click on the extension icon in the Chrome toolbar
2. Click the "Floating Chatbox" button in the popup
3. A moveable floating window will open where you can have general conversations with AI
4. The chatbox can be dragged around the screen by clicking and dragging the header
5. Use the minimize button to collapse the chatbox or the close button to close it
6. Your chat history is automatically saved and will persist between sessions

## Floating Chatbox Usage

The new Floating Chatbox feature in v4.1 provides a dedicated AI conversation window with advanced capabilities:

### How to Use:

1. **Basic Usage**: Click the extension icon and then click "Floating Chatbox" button
2. **With Selected Text**: Select any text on a webpage, then open the floating chatbox - the selected text will automatically be used as context
3. **Drag to Move**: Click and drag the chatbox header to reposition it anywhere on your screen
4. **Minimize/Restore**: Use the minimize button to reduce the chatbox to header-only mode
5. **Clear Selection**: If you have selected text, use the "×" button in the selection banner to clear it

### Features:

- **Smart Context**: Automatically detects and analyzes selected webpage text
- **Persistent History**: Your conversation history is saved locally and restored when you reopen
- **Elegant UI**: Modern glassmorphism design with smooth animations
- **Boundary Constraints**: Chatbox stays within your screen boundaries when dragging
- **Multi-Provider Support**: Works with all configured AI providers (Gemini, OpenAI, Claude)

### Example Workflows:

1. **Research**: Select a paragraph from an article, open chatbox, ask "Summarize this in simple terms"
2. **Code Review**: Select code snippet, ask "Explain what this code does"
3. **Translation**: Select foreign text, ask "Translate this to English"
4. **General Chat**: Open without selecting text for general AI conversations

## Development

- `manifest.json`: Extension configuration
- `popup.html` & `popup.js`: Settings UI
- `chatbox.html` & `src/chatbox.js`: Floating chatbox window and functionality
- `src/content.js` & `src/content.css`: Content script that adds AI buttons to the page
- `src/background.js`: Background script that handles AI API calls

## API Keys

You'll need to obtain API keys from the AI providers you wish to use:

- Google Gemini: https://ai.google.dev/
- OpenAI: https://platform.openai.com/
- Anthropic Claude: https://www.anthropic.com/

## License

MIT License

## Developer

Developed by CodeVionix | Masudur Rahman
