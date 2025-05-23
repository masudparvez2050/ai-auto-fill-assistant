document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['aiProvider', 'geminiApiKey', 'openaiApiKey', 'claudeApiKey', 'geminiModel', 'openaiModel', 'claudeModel'], function(data) {
    if (data.aiProvider) {
      document.getElementById('ai-provider').value = data.aiProvider;
      showProviderSettings(data.aiProvider);
    }
    
    if (data.geminiApiKey) {
      document.getElementById('gemini-api-key').value = data.geminiApiKey;
    }
    
    if (data.openaiApiKey) {
      document.getElementById('openai-api-key').value = data.openaiApiKey;
    }
    
    if (data.claudeApiKey) {
      document.getElementById('claude-api-key').value = data.claudeApiKey;
    }
    
    if (data.geminiModel) {
      document.getElementById('gemini-model').value = data.geminiModel;
    }
    
    if (data.openaiModel) {
      document.getElementById('openai-model').value = data.openaiModel;
    }
    
    if (data.claudeModel) {
      document.getElementById('claude-model').value = data.claudeModel;
    }
  });
  
  // Handle AI provider change
  document.getElementById('ai-provider').addEventListener('change', function() {
    showProviderSettings(this.value);
  });
  
  // Save settings
  document.getElementById('save-settings').addEventListener('click', function() {
    const aiProvider = document.getElementById('ai-provider').value;
    const geminiApiKey = document.getElementById('gemini-api-key').value;
    const openaiApiKey = document.getElementById('openai-api-key').value;
    const claudeApiKey = document.getElementById('claude-api-key').value;
    const geminiModel = document.getElementById('gemini-model').value;
    const openaiModel = document.getElementById('openai-model').value;
    const claudeModel = document.getElementById('claude-model').value;
    
    chrome.storage.sync.set({
      aiProvider: aiProvider,
      geminiApiKey: geminiApiKey,
      openaiApiKey: openaiApiKey,
      claudeApiKey: claudeApiKey,
      geminiModel: geminiModel,
      openaiModel: openaiModel,
      claudeModel: claudeModel
    }, function() {
      const status = document.getElementById('status');
      status.textContent = 'Settings saved!';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    });
  });
});

// Function to show the relevant provider settings
function showProviderSettings(provider) {
  document.getElementById('gemini-settings').style.display = 'none';
  document.getElementById('openai-settings').style.display = 'none';
  document.getElementById('claude-settings').style.display = 'none';
  
  document.getElementById(provider + '-settings').style.display = 'block';
}
