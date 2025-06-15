document.addEventListener("DOMContentLoaded", function () {
  // Load saved settings
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
    function (data) {
      if (data.aiProvider) {
        document.getElementById("ai-provider").value = data.aiProvider;
        showProviderSettings(data.aiProvider);
      }

      if (data.geminiApiKey) {
        document.getElementById("gemini-api-key").value = data.geminiApiKey;
      }

      if (data.openaiApiKey) {
        document.getElementById("openai-api-key").value = data.openaiApiKey;
      }

      if (data.claudeApiKey) {
        document.getElementById("claude-api-key").value = data.claudeApiKey;
      }

      if (data.geminiModel) {
        document.getElementById("gemini-model").value = data.geminiModel;
      }

      if (data.openaiModel) {
        document.getElementById("openai-model").value = data.openaiModel;
      }

      if (data.claudeModel) {
        document.getElementById("claude-model").value = data.claudeModel;
      }
    }
  );

  // Handle AI provider change
  document
    .getElementById("ai-provider")
    .addEventListener("change", function () {
      showProviderSettings(this.value);
    });
  // Save settings
  document
    .getElementById("save-settings")
    .addEventListener("click", function () {
      const aiProvider = document.getElementById("ai-provider").value;
      const geminiApiKey = document.getElementById("gemini-api-key").value;
      const openaiApiKey = document.getElementById("openai-api-key").value;
      const claudeApiKey = document.getElementById("claude-api-key").value;
      const geminiModel = document.getElementById("gemini-model").value;
      const openaiModel = document.getElementById("openai-model").value;
      const claudeModel = document.getElementById("claude-model").value;

      chrome.storage.sync.set(
        {
          aiProvider: aiProvider,
          geminiApiKey: geminiApiKey,
          openaiApiKey: openaiApiKey,
          claudeApiKey: claudeApiKey,
          geminiModel: geminiModel,
          openaiModel: openaiModel,
          claudeModel: claudeModel,
        },
        function () {
          const status = document.getElementById("status");
          status.textContent = "Settings saved!";
          setTimeout(function () {
            status.textContent = "";
          }, 2000);
        }
      );
    }); // Floating chatbox button
  document
    .getElementById("floating-chatbox")
    .addEventListener("click", async function () {
      try {
        // Get active tab
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        let selectedText = "";

        // Check if we can access the tab (not chrome://, edge://, etc.)
        if (
          tab &&
          tab.url &&
          !tab.url.startsWith("chrome://") &&
          !tab.url.startsWith("edge://") &&
          !tab.url.startsWith("chrome-extension://") &&
          !tab.url.startsWith("moz-extension://")
        ) {
          try {
            // Get selected text from the page
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: () => window.getSelection().toString().trim(),
            });
            selectedText = results[0]?.result || "";
          } catch (scriptError) {
            console.log(
              "Cannot access selected text from this page:",
              scriptError
            );
            // Continue without selected text
          }
        } else {
          console.log(
            "Cannot access selected text from browser internal pages"
          );
        }

        // Create chatbox URL with selected text parameter
        let chatboxUrl = chrome.runtime.getURL("chatbox.html");
        if (selectedText) {
          chatboxUrl += `?selectedText=${encodeURIComponent(selectedText)}`;
        }

        chrome.windows.create({
          url: chatboxUrl,
          type: "popup",
          width: 420,
          height: 570,
          left: screen.width - 436,
          top: 100,
        });
      } catch (error) {
        console.error("Error opening chatbox:", error);
        // Fallback: open without selected text
        try {
          chrome.windows.create({
            url: chrome.runtime.getURL("chatbox.html"),
            type: "popup",
            width: 420,
            height: 570,
            left: screen.width - 436,
            top: 100,
          });
        } catch (fallbackError) {
          console.error(
            "Failed to open chatbox even in fallback:",
            fallbackError
          );
          // Show user-friendly error message
          const status = document.getElementById("status");
          if (status) {
            status.textContent = "Unable to open chatbox. Please try again.";
            status.style.color = "#f44336";
            setTimeout(() => {
              status.textContent = "";
              status.style.color = "";
            }, 3000);
          }
        }
      }
    });
});

// Function to show the relevant provider settings
function showProviderSettings(provider) {
  document.getElementById("gemini-settings").style.display = "none";
  document.getElementById("openai-settings").style.display = "none";
  document.getElementById("claude-settings").style.display = "none";

  document.getElementById(provider + "-settings").style.display = "block";
}
