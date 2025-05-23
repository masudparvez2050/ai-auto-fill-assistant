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

    // Create a main container for both buttons
    const container = document.createElement("div");
    container.className = "ai-autofill-container";

    // Add the magic wand button container and button
    const wandContainer = document.createElement("div");
    wandContainer.className = "ai-autofill-wand-container";

    const wandIcon = document.createElement("div");
    wandIcon.className = "ai-autofill-wand";
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
    `;

    // Add tooltip to wand
    wandIcon.title = "AI Auto Fill";

    // Add the "Ask AI" button container and button
    const askContainer = document.createElement("div");
    askContainer.className = "ai-autofill-ask-container";

    const askIcon = document.createElement("div");
    askIcon.className = "ai-autofill-ask";
    askIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <text x="12" y="13" text-anchor="middle" font-size="9" fill="currentColor">?</text>
      </svg>
    `;

    // Add tooltip to ask button
    askIcon.title = "Ask AI to fill";

    // Position the container
    container.style.position = "absolute";
    container.style.zIndex = "9999";
    container.style.top = "50%";
    container.style.transform = "translateY(-50%)";
    container.style.right = "10px";

    // Append the buttons to their containers
    wandContainer.appendChild(wandIcon);
    askContainer.appendChild(askIcon);

    // Append both containers to the main container
    container.appendChild(askContainer);
    container.appendChild(wandContainer);

    // Add event listener for magic wand button to activate auto AI fill
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

      // Create a popup for entering a custom prompt
      const popup = document.createElement("div");
      popup.className = "ai-prompt-popup";
      popup.innerHTML = `
        <h3 style="margin-top: 0; font-size: 16px; color: #333;">Ask AI to generate</h3>
        <p style="margin-bottom: 10px; font-size: 13px; color: #666;">Enter your prompt or question to generate content:</p>
        <input type="text" placeholder="e.g., 'Write a professional bio'" class="ai-prompt-input">
        <div class="buttons">
          <button class="cancel-btn">Cancel</button>
          <button class="submit-btn">Generate</button>
        </div>
      `; // Position the popup
      askContainer.style.position = "relative";
      popup.style.position = "absolute";
      popup.style.top = "40px"; // Position below the button
      popup.style.right = "-140px"; // Center horizontally
      popup.style.zIndex = "10000";
      askContainer.appendChild(popup);

      // Focus the input
      const promptInput = popup.querySelector(".ai-prompt-input");
      promptInput.focus();

      // Add event listeners for the popup buttons
      const cancelBtn = popup.querySelector(".cancel-btn");
      const submitBtn = popup.querySelector(".submit-btn");

      cancelBtn.addEventListener("click", function () {
        popup.remove();
      });

      // Generate content when submit is clicked
      submitBtn.addEventListener("click", function () {
        const customPrompt = promptInput.value.trim();
        if (!customPrompt) {
          alert("Please enter a prompt");
          return;
        }

        // Remove the popup
        popup.remove();

        // Show loading state
        askIcon.classList.add("loading");

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
                askIcon.classList.remove("loading");
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
              }

              // Remove loading state
              askIcon.classList.remove("loading");
            }
          );
        } catch (error) {
          console.error("AI Auto Fill: Failed to send message", error);
          askIcon.classList.remove("loading");
          alert(
            "AI Auto Fill: Extension error occurred. Please refresh the page and try again."
          );
        }
      });

      // Handle Enter key in the prompt input
      promptInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          submitBtn.click();
        } else if (e.key === "Escape") {
          cancelBtn.click();
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

    // Add the container to the body or the input's parent to handle positioning better
    const parent = input.parentElement;
    if (parent && parent.style) {
      if (window.getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }
      parent.appendChild(container);
    } else {
      document.body.appendChild(container);
    }

    // Update position when the window is resized
    const updatePosition = function () {
      try {
        if (
          !document.body.contains(input) ||
          !document.body.contains(container)
        ) {
          window.removeEventListener("resize", updatePosition);
          document.removeEventListener("scroll", updatePosition, true);
          return;
        }

        // No need to update the position since we're using relative positioning
        // This function is now mainly checking if elements still exist
      } catch (error) {
        console.error("AI Auto Fill: Error updating position", error);
      }
    };

    window.addEventListener("resize", updatePosition);

    // Update position when scrolling
    document.addEventListener("scroll", updatePosition, true);
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
