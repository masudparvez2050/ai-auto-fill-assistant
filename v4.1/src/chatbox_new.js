// Chatbox functionality
class AIFloatingChatbox {
  constructor() {
    this.isDragging = false;
    this.isMinimized = false;
    this.dragOffset = { x: 0, y: 0 };
    this.messages = [];
    this.selectedText = '';
    
    this.initializeElements();
    this.bindEvents();
    this.makeDraggable();
    this.loadMessages();
    this.checkForSelectedText();
  }
  
  initializeElements() {
    this.container = document.getElementById("chatboxContainer");
    this.header = document.getElementById("chatboxHeader");
    this.messagesContainer = document.getElementById("chatMessages");
    this.input = document.getElementById("chatInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.minimizeBtn = document.getElementById("minimizeBtn");
    this.closeBtn = document.getElementById("closeBtn");
    this.typingIndicator = document.getElementById("typingIndicator");
  }
  
  bindEvents() {
    // Send message events
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    this.input.addEventListener("input", () => {
      this.input.style.height = "auto";
      this.input.style.height = Math.min(this.input.scrollHeight, 100) + "px";
    });
    
    // Control buttons
    this.minimizeBtn.addEventListener("click", () => this.toggleMinimize());
    this.closeBtn.addEventListener("click", () => this.closeChatbox());
    
    // Prevent context menu on header for better UX
    this.header.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  
  makeDraggable() {
    this.header.addEventListener("mousedown", (e) => {
      if (e.target.closest(".control-btn")) return; // Don't drag when clicking control buttons
      
      this.isDragging = true;
      const rect = this.container.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      document.addEventListener("mousemove", this.handleDrag);
      document.addEventListener("mouseup", this.handleDragEnd);
      
      this.header.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    });
  }
  
  handleDrag = (e) => {
    if (!this.isDragging) return;
    
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    
    // Keep chatbox within viewport bounds
    const maxX = window.innerWidth - this.container.offsetWidth;
    const maxY = window.innerHeight - this.container.offsetHeight;
    
    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));
    
    this.container.style.left = constrainedX + "px";
    this.container.style.top = constrainedY + "px";
    this.container.style.position = "fixed";
  };
  
  handleDragEnd = () => {
    this.isDragging = false;
    this.header.style.cursor = "move";
    document.body.style.userSelect = "";
    
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("mouseup", this.handleDragEnd);
  };
  
  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;
    
    // Add user message
    this.addMessage(message, "user");
    this.input.value = "";
    this.input.style.height = "auto";
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Create enhanced prompt with selected text context
      let enhancedPrompt = message;
      if (this.selectedText) {
        enhancedPrompt = `Selected Text: "${this.selectedText}"\n\nUser Question: ${message}\n\nPlease analyze the selected text and respond to the user's question about it.`;
      }
      
      // Get AI response
      const response = await this.getAIResponse(enhancedPrompt);
      this.hideTypingIndicator();
      this.addMessage(response, "ai");
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I encountered an error while processing your request. Please check your API settings and try again.",
        "ai"
      );
      console.error("AI Response Error:", error);
    }
  }
  
  async getAIResponse(message) {
    // Get stored settings
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(
        [
          "aiProvider",
          "geminiApiKey",
          "openaiApiKey",
          "claudeApiKey",
          "geminiModel",
          "openaiModel",
          "claudeModel",
        ],
        async (data) => {
          try {
            if (!data.aiProvider) {
              throw new Error("No AI provider selected");
            }
            
            let response;
            
            if (data.aiProvider === "gemini" && data.geminiApiKey) {
              response = await this.callGeminiAPI(
                message,
                data.geminiApiKey,
                data.geminiModel || "gemini-2.0-flash"
              );
            } else if (data.aiProvider === "openai" && data.openaiApiKey) {
              response = await this.callOpenAIAPI(
                message,
                data.openaiApiKey,
                data.openaiModel || "gpt-3.5-turbo"
              );
            } else if (data.aiProvider === "claude" && data.claudeApiKey) {
              response = await this.callClaudeAPI(
                message,
                data.claudeApiKey,
                data.claudeModel || "claude-instant"
              );
            } else {
              throw new Error("API key not found for selected provider");
            }
            
            resolve(response);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }
  
  async callGeminiAPI(message, apiKey, model) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
  
  async callOpenAIAPI(message, apiKey, model) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: message }],
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async callClaudeAPI(message, apiKey, model) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        messages: [{ role: "user", content: message }],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  }
  
  addMessage(content, type) {
    const messageData = {
      content,
      type,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    
    this.messages.push(messageData);
    this.saveMessages();
    
    // Remove empty state if it exists
    const emptyState = this.messagesContainer.querySelector(".empty-state");
    if (emptyState) {
      emptyState.remove();
    }
    
    const messageElement = this.createMessageElement(messageData);
    this.messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  createMessageElement(messageData) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${messageData.type}`;
    
    const avatar = document.createElement("div");
    avatar.className = `message-avatar ${messageData.type}-avatar`;
    avatar.innerHTML =
      messageData.type === "user"
        ? '<i class="fas fa-user"></i>'
        : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = messageData.content;
    
    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";
    timeDiv.textContent = messageData.timestamp;
    
    contentDiv.appendChild(timeDiv);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    return messageDiv;
  }
  
  showTypingIndicator() {
    this.typingIndicator.style.display = "flex";
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  hideTypingIndicator() {
    this.typingIndicator.style.display = "none";
  }
  
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    
    if (this.isMinimized) {
      this.container.style.height = "56px";
      this.minimizeBtn.innerHTML = '<i class="fas fa-window-maximize"></i>';
      this.minimizeBtn.title = "Restore";
    } else {
      this.container.style.height = "500px";
      this.minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
      this.minimizeBtn.title = "Minimize";
    }
  }
  
  closeChatbox() {
    window.close();
  }
  
  saveMessages() {
    localStorage.setItem("chatboxMessages", JSON.stringify(this.messages));
  }
  
  loadMessages() {
    const savedMessages = localStorage.getItem("chatboxMessages");
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
      
      if (this.messages.length > 0) {
        // Remove empty state
        const emptyState = this.messagesContainer.querySelector(".empty-state");
        if (emptyState) {
          emptyState.remove();
        }
        
        // Load all messages
        this.messages.forEach((messageData) => {
          const messageElement = this.createMessageElement(messageData);
          this.messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    }
  }
  
  // Position chatbox in a nice default location
  positionChatbox() {
    const x = window.innerWidth - this.container.offsetWidth - 20;
    const y = Math.max(
      20,
      window.innerHeight - this.container.offsetHeight - 20
    );
    
    this.container.style.position = "fixed";
    this.container.style.left = x + "px";
    this.container.style.top = y + "px";
    this.container.style.zIndex = "10000";
  }
  
  // Check for selected text from URL parameters
  checkForSelectedText() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedText = urlParams.get('selectedText');
    
    if (selectedText && selectedText.trim()) {
      this.selectedText = selectedText.trim();
      this.showSelectedTextBanner();
    }
  }
  
  // Show banner with selected text
  showSelectedTextBanner() {
    if (!this.selectedText) return;
    
    const banner = document.createElement('div');
    banner.className = 'selected-text-banner';
    banner.innerHTML = `
      <div class="banner-header">
        <i class="fas fa-text-width"></i>
        <span>Selected Text:</span>
        <button class="clear-selection-btn" title="Clear selection">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="banner-content">${this.selectedText}</div>
    `;
    
    // Insert before chat messages
    this.container.insertBefore(banner, this.messagesContainer);
    
    // Add clear button functionality
    banner.querySelector('.clear-selection-btn').addEventListener('click', () => {
      this.selectedText = '';
      banner.remove();
      // Update URL to remove selectedText parameter
      const url = new URL(window.location);
      url.searchParams.delete('selectedText');
      window.history.replaceState({}, '', url);
    });
  }
}

// Initialize chatbox when page loads
document.addEventListener("DOMContentLoaded", () => {
  const chatbox = new AIFloatingChatbox();
  chatbox.positionChatbox();
  
  // Focus on input
  setTimeout(() => {
    chatbox.input.focus();
  }, 100);
});
