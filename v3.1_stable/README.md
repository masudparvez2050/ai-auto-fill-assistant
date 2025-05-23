# AI Auto Fill Chrome Extension

## Overview

This Chrome extension adds a smart AI assistant to input fields on websites. It offers three powerful AI features: Auto Fill, Ask AI, and Content Enhancement, allowing you to automatically generate or improve content for any form field.

## Features

- **Auto Fill**: Instantly generates appropriate content for any field based on context
- **Ask AI**: Ask the AI to generate specific content with your own custom prompt
- **Content Enhancement**: Improve existing text with AI-powered enhancements
- Sleek capsule-shaped UI that appears when you focus on an input field
- Supports multiple AI providers (Gemini, OpenAI, Claude)
- Configurable AI models for each provider
- Contextual content generation based on field type and form purpose
- Loading animations and tooltips for improved user experience

## Installation

### From Chrome Web Store

1. Visit the [AI Auto Fill Assistant](https://chrome.google.com/webstore/detail/ai-auto-fill-assistant/your-extension-id) on Chrome Web Store
2. Click "Add to Chrome"
3. The extension will be installed and ready to use

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
3. Click the purple magic wand button to automatically generate content
4. The field will be filled with AI-generated content

### Ask AI

1. Click into any input field
2. Click the green chat bubble button
3. Enter your specific request or prompt in the popup
4. Press Enter to generate customized content

### Content Enhancement

1. Write or paste some text into an input field
2. Click the blue enhancement button (only active when field has content)
3. The AI will improve your text while maintaining its original meaning

## Development

- `manifest.json`: Extension configuration
- `popup.html` & `popup.js`: Settings UI
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
