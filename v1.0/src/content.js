// Function to create and add the magic wand button to input fields
function addMagicWandToInputs() {
  console.log("AI Auto Fill: Adding magic wands to inputs");

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
    // Skip if already has a wand
    if (input.dataset.hasWand === "true") {
      return;
    }

    // Mark as having a wand
    input.dataset.hasWand = "true";

    // Create a container for the wand icon
    const container = document.createElement("div");
    container.className = "ai-autofill-wand-container";
    // Create the wand icon
    const wandIcon = document.createElement("div");
    wandIcon.className = "ai-autofill-wand";
    wandIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
        <line x1="3" y1="22" x2="21" y2="22"></line>
        <line x1="12" y1="15" x2="15" y2="15"></line>
        <line x1="17" y1="11" x2="17" y2="11"></line>
      </svg>
    `;

    // Add tooltip
    wandIcon.title = "AI Auto Fill";

    // Position the container
    const rect = input.getBoundingClientRect();
    const inputStyle = window.getComputedStyle(input);
    container.style.position = "absolute";
    container.style.zIndex = "9999";
    container.style.top = `${input.offsetTop + 4}px`;
    container.style.left = `${input.offsetLeft + input.offsetWidth - 24}px`;

    // Append the wand to the container
    container.appendChild(wandIcon);

    // Add event listener to activate AI autofill
    wandIcon.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Determine what kind of input field this is
      let fieldContext = determineFieldContext(input);
      console.log("AI Auto Fill: Field context", fieldContext);

      // Show loading state
      wandIcon.classList.add("loading");

      // Send message to background script to generate content
      chrome.runtime.sendMessage(
        {
          action: "generateContent",
          fieldContext: fieldContext,
        },
        function (response) {
          console.log("AI Auto Fill: Got response from background", response);
          if (response && response.generatedText) {
            // Fill the input with AI-generated content
            if (input.tagName.toLowerCase() === "div") {
              // For contenteditable divs
              input.innerHTML = response.generatedText;
            } else {
              // For regular inputs and textareas
              input.value = response.generatedText;

              // Trigger input event to notify any listeners
              const inputEvent = new Event("input", { bubbles: true });
              input.dispatchEvent(inputEvent);

              // Trigger change event
              const changeEvent = new Event("change", { bubbles: true });
              input.dispatchEvent(changeEvent);
            }
          }

          // Remove loading state
          wandIcon.classList.remove("loading");
        }
      );
    });

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
    window.addEventListener("resize", function () {
      const rect = input.getBoundingClientRect();
      container.style.top = `${input.offsetTop + 4}px`;
      container.style.left = `${input.offsetLeft + input.offsetWidth - 24}px`;
    });

    // Update position when scrolling
    document.addEventListener(
      "scroll",
      function () {
        const rect = input.getBoundingClientRect();
        container.style.top = `${input.offsetTop + 4}px`;
        container.style.left = `${input.offsetLeft + input.offsetWidth - 24}px`;
      },
      true
    );
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

  // Add magic wand to all current inputs
  addMagicWandToInputs();

  // Create MutationObserver to watch for dynamically added inputs
  const observer = new MutationObserver(function (mutations) {
    let shouldCheck = false;

    mutations.forEach(function (mutation) {
      if (mutation.addedNodes.length > 0) {
        shouldCheck = true;
      }
    });

    if (shouldCheck) {
      addMagicWandToInputs();
    }
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Run our initialization both on DOMContentLoaded and after a short delay to ensure we catch all scenarios
document.addEventListener("DOMContentLoaded", initializeExtension);

// Also run after a short delay in case the document was already loaded
setTimeout(initializeExtension, 1000);

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "refreshMagicWands") {
    // Remove existing wands and re-add them
    const existingWands = document.querySelectorAll(
      ".ai-autofill-wand-container"
    );
    existingWands.forEach((wand) => wand.remove());

    // Reset the dataset flags
    const inputs = document.querySelectorAll(
      'input, textarea, div[contenteditable="true"]'
    );
    inputs.forEach((input) => {
      delete input.dataset.hasWand;
    });

    // Add wands again
    addMagicWandToInputs();
  }

  return true;
});
