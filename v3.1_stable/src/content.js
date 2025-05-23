// Function to create and add AI buttons to input fields
function addAIButtonsToInputs() {
  console.log("AI Auto Fill: Adding AI buttons to inputs");

  // CSS selectors for various input fields and textareas
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input:not([type="hidden"])',
    'input:not([type="checkbox"])',
    'input:not([type="radio"])',
    'input:not([type="button"])',
    'input:not([type="submit"])',
    "textarea",
    'div[contenteditable="true"]',
    '[role="textbox"]',
  ];

  // Get all relevant input elements
  const inputElements = document.querySelectorAll(selectors.join(", "));
  console.log("AI Auto Fill: Found", inputElements.length, "input elements");

  inputElements.forEach((input, index) => {
    // Skip if already has buttons
    if (input.dataset.hasAiButtons === "true") {
      return;
    }

    // Mark as having AI buttons
    input.dataset.hasAiButtons = "true";

    // Create a main container for all buttons (capsule shape)
    const container = document.createElement("div");
    container.className = "ai-autofill-container";
    container.style.display = "none"; // Initially hidden, will show on focus

    // Add the magic wand button
    const wandIcon = document.createElement("div");
    wandIcon.className = "ai-autofill-button ai-autofill-wand";
    wandIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- Magic star -->
      <polygon points="6,2 5,5 2,6 5,7 6,10 7,7 10,6 7,5" fill="currentColor"/>
      <!-- Wand handle -->
      <line x1="6" y1="10" x2="18" y2="22" stroke-width="2"/>
      <!-- Small sparkles -->
      <circle cx="10" cy="5" r="0.5" fill="currentColor"/>
      <circle cx="2" cy="10" r="0.5" fill="currentColor"/>
      <circle cx="12" cy="9" r="0.5" fill="currentColor"/>
      </svg>
      <span class="ai-button-tooltip">Auto Fill</span>
    `;

    // Add the "Ask AI" button
    const askIcon = document.createElement("div");
    askIcon.className = "ai-autofill-button ai-autofill-ask";
    askIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <text x="12" y="13" text-anchor="middle" font-size="9" fill="currentColor">?</text>
      </svg>
      <span class="ai-button-tooltip">Ask AI</span>
    `;

    // Add the "Enhance" button
    const enhanceIcon = document.createElement("div");
    enhanceIcon.className = "ai-autofill-button ai-autofill-enhance";
    // Initially disabled
    enhanceIcon.classList.add("disabled");
    enhanceIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <span class="ai-button-tooltip">Enhance</span>
    `;

    // Append all buttons to the container
    container.appendChild(wandIcon);
    container.appendChild(askIcon);
    container.appendChild(enhanceIcon);

    // Position the container
    container.style.position = "absolute";
    container.style.zIndex = "9999";
    container.style.top = "50%";
    container.style.transform = "translateY(-50%)";
    container.style.right = "10px";

    // Show container on focus and check content for enhance button
    input.addEventListener("focus", function () {
      container.style.display = "flex";
      checkContentForEnhanceButton();
    });

    // Hide container on blur (except if clicking a button or popup)
    input.addEventListener("blur", function (e) {
      // Check if clicked element is part of our UI
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (
          container.contains(activeElement) ||
          document.querySelector(".ai-prompt-popup")?.contains(activeElement)
        ) {
          return;
        }
        container.style.display = "none";
      }, 200);
    });

    // Listen for input to enable/disable enhance button
    input.addEventListener("input", checkContentForEnhanceButton);

    // Function to check if there's content to enhance
    function checkContentForEnhanceButton() {
      let hasContent = false;
      if (input.tagName.toLowerCase() === "div") {
        hasContent = input.innerText.trim().length > 0;
      } else {
        hasContent = input.value.trim().length > 0;
      }

      if (hasContent) {
        enhanceIcon.classList.remove("disabled");
      } else {
        enhanceIcon.classList.add("disabled");
      }
    }

    // Add event listener for magic wand button
    wandIcon.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Determine what kind of input field this is
      let fieldContext = determineFieldContext(input);
      console.log("AI Auto Fill: Field context", fieldContext);

      // Show loading state
      wandIcon.classList.add("loading");

      // Try to send message to background script to generate content
      try {
        chrome.runtime.sendMessage(
          {
            action: "generateContent",
            fieldContext: fieldContext,
          },
          function (response) {
            // Check if runtime error occurred
            if (chrome.runtime.lastError) {
              console.error(
                "AI Auto Fill: Runtime error",
                chrome.runtime.lastError
              );
              wandIcon.classList.remove("loading");
              alert(
                "AI Auto Fill: Extension error occurred. Please refresh the page and try again."
              );
              return;
            }

            console.log("AI Auto Fill: Got response from background", response);
            if (response && response.generatedText) {
              fillInputWithContent(input, response.generatedText);
              checkContentForEnhanceButton(); // Re-check after filling
            }

            // Remove loading state
            wandIcon.classList.remove("loading");
          }
        );
      } catch (error) {
        console.error("AI Auto Fill: Failed to send message", error);
        wandIcon.classList.remove("loading");
        alert(
          "AI Auto Fill: Extension error occurred. Please refresh the page and try again."
        );
      }
    });

    // Add event listener for "Ask AI" button
    askIcon.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Remove any existing popups
      document
        .querySelectorAll(".ai-prompt-popup")
        .forEach((popup) => popup.remove());

      // Create a popup for entering a custom prompt
      const popup = document.createElement("div");
      popup.className = "ai-prompt-popup";
      popup.innerHTML = `
        <div class="ai-prompt-input-container">
          <input type="text" placeholder="Ask AI for content..." class="ai-prompt-input">
          <div class="ai-spinner"></div>
        </div>
      `;

      // Position the popup
      document.body.appendChild(popup);
      positionPopupNearButton(popup, askIcon);

      // Focus the input
      const promptInput = popup.querySelector(".ai-prompt-input");
      promptInput.focus();

      // Handle Enter key in the prompt input
      promptInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          const customPrompt = promptInput.value.trim();
          if (!customPrompt) {
            return;
          }

          // Show loading animation
          popup.classList.add("loading");

          // Get field context
          let fieldContext = determineFieldContext(input);

          // Send message to generate content with custom prompt
          try {
            chrome.runtime.sendMessage(
              {
                action: "generateContent",
                fieldContext: fieldContext,
                customPrompt: customPrompt,
              },
              function (response) {
                // Check if runtime error occurred
                if (chrome.runtime.lastError) {
                  console.error(
                    "AI Auto Fill: Runtime error",
                    chrome.runtime.lastError
                  );
                  popup.classList.remove("loading");
                  popup.remove();
                  alert(
                    "AI Auto Fill: Extension error occurred. Please refresh the page and try again."
                  );
                  return;
                }

                console.log(
                  "AI Auto Fill: Got response from background",
                  response
                );
                if (response && response.generatedText) {
                  fillInputWithContent(input, response.generatedText);
                  checkContentForEnhanceButton(); // Re-check after filling
                }

                // Remove loading state and popup
                popup.classList.remove("loading");
                popup.remove();
              }
            );
          } catch (error) {
            console.error("AI Auto Fill: Failed to send message", error);
            popup.classList.remove("loading");
            popup.remove();
            alert(
              "AI Auto Fill: Extension error occurred. Please refresh the page and try again."
            );
          }
        } else if (e.key === "Escape") {
          popup.remove();
        }
      });

      // Close popup when clicking outside
      document.addEventListener("click", function closePopup(event) {
        if (!popup.contains(event.target) && event.target !== askIcon) {
          popup.remove();
          document.removeEventListener("click", closePopup);
        }
      });
    });

    // Add event listener for "Enhance" button
    enhanceIcon.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Skip if disabled
      if (enhanceIcon.classList.contains("disabled")) {
        return;
      }

      // Get current content
      let currentContent = "";
      if (input.tagName.toLowerCase() === "div") {
        currentContent = input.innerText;
      } else {
        currentContent = input.value;
      }

      if (!currentContent.trim()) {
        return;
      }

      // Show loading state
      enhanceIcon.classList.add("loading");

      // Get field context
      let fieldContext = determineFieldContext(input);

      // Send message to enhance content
      try {
        chrome.runtime.sendMessage(
          {
            action: "enhanceContent",
            fieldContext: fieldContext,
            currentContent: currentContent,
          },
          function (response) {
            // Check if runtime error occurred
            if (chrome.runtime.lastError) {
              console.error(
                "AI Auto Fill: Runtime error",
                chrome.runtime.lastError
              );
              enhanceIcon.classList.remove("loading");
              alert(
                "AI Auto Fill: Extension error occurred. Please refresh the page and try again."
              );
              return;
            }

            console.log("AI Auto Fill: Got enhancement response", response);
            if (response && response.enhancedText) {
              fillInputWithContent(input, response.enhancedText);
            }

            // Remove loading state
            enhanceIcon.classList.remove("loading");
          }
        );
      } catch (error) {
        console.error("AI Auto Fill: Failed to send message", error);
        enhanceIcon.classList.remove("loading");
        alert(
          "AI Auto Fill: Extension error occurred. Please refresh the page and try again."
        );
      }
    });

    // Helper function to position popup near button
    function positionPopupNearButton(popup, button) {
      const buttonRect = button.getBoundingClientRect();
      const popupWidth = 240; // Fixed popup width

      popup.style.position = "fixed";
      popup.style.width = popupWidth + "px";
      popup.style.left =
        buttonRect.left - popupWidth / 2 + buttonRect.width / 2 + "px";
      popup.style.top = buttonRect.bottom + 10 + "px";
      popup.style.zIndex = "10000";
    }

    // Helper function to fill inputs with generated content
    function fillInputWithContent(input, content) {
      if (input.tagName.toLowerCase() === "div") {
        // For contenteditable divs
        input.innerHTML = content;
      } else {
        // For regular inputs and textareas
        input.value = content;

        // Trigger input event to notify any listeners
        const inputEvent = new Event("input", { bubbles: true });
        input.dispatchEvent(inputEvent);

        // Trigger change event
        const changeEvent = new Event("change", { bubbles: true });
        input.dispatchEvent(changeEvent);
      }
    }

    // Add the container to the body or the input's parent
    const parent = input.parentElement;
    if (parent && parent.style) {
      if (window.getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }
      parent.appendChild(container);
    } else {
      document.body.appendChild(container);
    }

    // Initial check for enhance button
    checkContentForEnhanceButton();
  });
}

// Function to determine the context of the field
function determineFieldContext(input) {
  let fieldContext = {
    fieldType: "text",
    fieldName: input.name || "",
    fieldId: input.id || "",
    fieldPlaceholder: input.placeholder || "",
    nearbyLabels: [],
    parentForm: null,
    formPurpose: "",
  };

  // Check if it's a textarea (likely for longer content)
  if (input.tagName.toLowerCase() === "textarea") {
    fieldContext.fieldType = "longText";
  }

  // Check for contenteditable divs (rich text)
  if (
    input.tagName.toLowerCase() === "div" &&
    input.getAttribute("contenteditable") === "true"
  ) {
    fieldContext.fieldType = "richText";
  }

  // Try to find labels associated with this input
  const labels = document.querySelectorAll("label");
  labels.forEach((label) => {
    if (label.htmlFor === input.id) {
      fieldContext.nearbyLabels.push(label.textContent.trim());
    }
  });

  // If no direct label, look for nearby text that might describe the field
  if (fieldContext.nearbyLabels.length === 0) {
    // Look for text nodes directly preceding the input
    let node = input.previousSibling;
    while (node) {
      if (node.nodeType === 3 && node.textContent.trim()) {
        // Text node
        fieldContext.nearbyLabels.push(node.textContent.trim());
        break;
      } else if (node.nodeType === 1) {
        // Element node
        const text = node.textContent.trim();
        if (text) {
          fieldContext.nearbyLabels.push(text);
          break;
        }
      }
      node = node.previousSibling;
    }
  }

  // Try to determine the form's purpose
  const parentForm = input.closest("form");
  if (parentForm) {
    fieldContext.parentForm = {
      id: parentForm.id || "",
      action: parentForm.action || "",
      method: parentForm.method || "",
      className: parentForm.className || "",
      fields: [],
    };

    // Get all input fields in the form to determine its purpose
    const formInputs = parentForm.querySelectorAll("input, textarea, select");
    formInputs.forEach((formInput) => {
      if (formInput.name && formInput.type !== "hidden") {
        fieldContext.parentForm.fields.push({
          name: formInput.name,
          type: formInput.type,
          id: formInput.id || "",
        });
      }
    });

    // Try to determine form purpose based on inputs and form action
    if (
      parentForm.action.includes("login") ||
      parentForm.id.includes("login") ||
      parentForm.className.includes("login")
    ) {
      fieldContext.formPurpose = "login";
    } else if (
      parentForm.action.includes("register") ||
      parentForm.id.includes("register") ||
      parentForm.className.includes("register") ||
      parentForm.action.includes("signup") ||
      parentForm.id.includes("signup") ||
      parentForm.className.includes("signup")
    ) {
      fieldContext.formPurpose = "registration";
    } else if (
      parentForm.action.includes("comment") ||
      parentForm.id.includes("comment") ||
      parentForm.className.includes("comment")
    ) {
      fieldContext.formPurpose = "comment";
    } else if (
      parentForm.action.includes("post") ||
      parentForm.id.includes("post") ||
      parentForm.className.includes("post") ||
      parentForm.action.includes("blog") ||
      parentForm.id.includes("blog") ||
      parentForm.className.includes("blog")
    ) {
      fieldContext.formPurpose = "blogPost";
    } else if (
      parentForm.action.includes("checkout") ||
      parentForm.id.includes("checkout") ||
      parentForm.className.includes("checkout") ||
      parentForm.action.includes("payment") ||
      parentForm.id.includes("payment") ||
      parentForm.className.includes("payment")
    ) {
      fieldContext.formPurpose = "checkout";
    }
  }

  return fieldContext;
}

// Initial setup when the page loads
console.log("AI Auto Fill: Content script loaded");

// Function to initialize everything
function initializeExtension() {
  console.log("AI Auto Fill: Initializing extension");

  try {
    // Add AI buttons to all current inputs
    addAIButtonsToInputs();

    // Create MutationObserver to watch for dynamically added inputs
    const observer = new MutationObserver(function (mutations) {
      try {
        let shouldCheck = false;

        mutations.forEach(function (mutation) {
          if (mutation.addedNodes.length > 0) {
            shouldCheck = true;
          }
        });

        if (shouldCheck) {
          addAIButtonsToInputs();
        }
      } catch (error) {
        console.error(
          "AI Auto Fill: Error in MutationObserver callback",
          error
        );
      }
    });

    // Start observing the document with error handling
    try {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      console.log("AI Auto Fill: MutationObserver started");
    } catch (error) {
      console.error("AI Auto Fill: Failed to start MutationObserver", error);
    }
  } catch (error) {
    console.error("AI Auto Fill: Error during initialization", error);
  }
}

// Run our initialization both on DOMContentLoaded and after a short delay to ensure we catch all scenarios
document.addEventListener("DOMContentLoaded", initializeExtension);

// Also run after a short delay in case the document was already loaded
setTimeout(initializeExtension, 1000);

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "refreshAIButtons") {
    // Remove existing buttons and re-add them
    const existingContainers = document.querySelectorAll(
      ".ai-autofill-container"
    );
    existingContainers.forEach((container) => container.remove());

    // Reset the dataset flags
    const inputs = document.querySelectorAll(
      'input, textarea, div[contenteditable="true"]'
    );
    inputs.forEach((input) => {
      delete input.dataset.hasAiButtons;
    });

    // Add buttons again
    addAIButtonsToInputs();
  }

  return true;
});
