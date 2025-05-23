# AI Auto Fill Chrome Extension

## Overview

This Chrome extension adds a magic wand icon to input fields on websites. When clicked, it uses AI to automatically generate appropriate content for that field based on context.

## Features

- Works with any input field or form
- Supports multiple AI providers (Gemini, OpenAI, Claude)
- Configurable AI models for each provider
- Contextual content generation based on field type and form purpose

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top-right corner
3. Click "Load unpacked" and select the extension directory
4. The extension should now be installed and ready to use

## Configuration

1. Click on the extension icon in the Chrome toolbar
2. Select your preferred AI provider
3. Enter your API key for the selected provider
4. Choose the AI model you want to use
5. Click "Save Settings"

## Usage

1. Navigate to any website with forms or input fields
2. Look for the magic wand icon on the right side of input fields
3. Click the icon to generate AI content for that field
4. The content will be automatically filled in

## Development

- `manifest.json`: Extension configuration
- `popup.html` & `popup.js`: Settings UI
- `src/content.js` & `src/content.css`: Content script that adds magic wands to the page
- `src/background.js`: Background script that handles AI API calls

## API Keys

You'll need to obtain API keys from the AI providers you wish to use:

- Google Gemini: https://ai.google.dev/
- OpenAI: https://platform.openai.com/
- Anthropic Claude: https://www.anthropic.com/

## License

MIT License
