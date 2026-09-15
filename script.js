/**
 * Thiranex Internship Task - Personal Portfolio JavaScript
 * Author: Saran (Computer Science Engineering Student)
 * Purpose: Accessible mobile navigation toggle & WCAG compliant contact form validation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Mobile Navigation Toggle
  initMobileNav();

  // Initialize Contact Form Accessibility & Validation
  initContactForm();
});

/**
 * Handles accessible mobile navigation menu toggling
 */
function initMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (!navToggle || !mainNav) return;

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    const newExpandedState = !isExpanded;

    navToggle.setAttribute('aria-expanded', newExpandedState.toString());
    mainNav.classList.toggle('is-expanded', newExpandedState);

    // Update accessible button text visually & for screen readers
    const toggleText = navToggle.querySelector('.nav-toggle-text');
    if (toggleText) {
      toggleText.textContent = newExpandedState ? 'Close Menu' : 'Open Menu';
    }
  });

  // Close mobile navigation on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-expanded')) {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-expanded');
      const toggleText = navToggle.querySelector('.nav-toggle-text');
      if (toggleText) toggleText.textContent = 'Open Menu';
      navToggle.focus();
    }
  });
}

/**
 * Handles keyboard-accessible contact form validation and screen-reader alerts
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertContainer = document.getElementById('form-alert-container');

  if (!form) return;

  const fields = [
    { id: 'fullname', name: 'Full Name', required: true },
    { id: 'email', name: 'Email Address', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, errorMsg: 'Please enter a valid email address (e.g., saran@example.com).' },
    { id: 'phone', name: 'Phone Number', required: false },
    { id: 'subject', name: 'Subject', required: true },
    { id: 'message', name: 'Message', required: true }
  ];

  // Attach blur event listener for real-time accessible validation feedback
  fields.forEach(fieldInfo => {
    const inputElement = document.getElementById(fieldInfo.id);
    if (!inputElement) return;

    inputElement.addEventListener('blur', () => {
      validateSingleField(inputElement, fieldInfo);
    });

    // Clear error dynamically as user types
    inputElement.addEventListener('input', () => {
      if (inputElement.getAttribute('aria-invalid') === 'true') {
        validateSingleField(inputElement, fieldInfo);
      }
    });
  });

  // Handle Form Submission
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;
    let firstInvalidInput = null;

    fields.forEach(fieldInfo => {
      const inputElement = document.getElementById(fieldInfo.id);
      if (inputElement) {
        const fieldValid = validateSingleField(inputElement, fieldInfo);
        if (!fieldValid && isValid) {
          isValid = false;
          firstInvalidInput = inputElement;
        }
      }
    });

    if (!isValid) {
      // Focus the first invalid input for keyboard users (WCAG 2.4.3)
      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
      if (alertContainer) {
        alertContainer.className = 'form-alert form-alert-error';
        alertContainer.setAttribute('role', 'alert');
        alertContainer.innerHTML = '<strong>Form submission failed:</strong> Please correct the errors marked below before submitting.';
      }
      return;
    }

    // Success State
    if (alertContainer) {
      alertContainer.className = 'form-alert form-alert-success';
      alertContainer.setAttribute('role', 'status');
      alertContainer.innerHTML = '<strong>Thank you, ' + escapeHTML(document.getElementById('fullname').value) + '!</strong> Your message has been sent successfully. I will get back to you shortly.';
    }

    form.reset();

    // Clear invalid attributes
    fields.forEach(fieldInfo => {
      const inputElement = document.getElementById(fieldInfo.id);
      if (inputElement) {
        inputElement.removeAttribute('aria-invalid');
        const errorSpan = document.getElementById(fieldInfo.id + '-error');
        if (errorSpan) errorSpan.textContent = '';
      }
    });
  });

  // Handle Form Reset
  form.addEventListener('reset', () => {
    fields.forEach(fieldInfo => {
      const inputElement = document.getElementById(fieldInfo.id);
      if (inputElement) {
        inputElement.removeAttribute('aria-invalid');
        const errorSpan = document.getElementById(fieldInfo.id + '-error');
        if (errorSpan) errorSpan.textContent = '';
      }
    });
    if (alertContainer) {
      alertContainer.className = 'sr-only';
      alertContainer.innerHTML = '';
    }
  });
}

/**
 * Validates a single input element and updates aria-invalid & error text
 */
function validateSingleField(inputElement, fieldInfo) {
  const value = inputElement.value.trim();
  const errorSpan = document.getElementById(fieldInfo.id + '-error');
  let errorMessage = '';

  if (fieldInfo.required && value === '') {
    errorMessage = `${fieldInfo.name} is required.`;
  } else if (fieldInfo.pattern && value !== '' && !fieldInfo.pattern.test(value)) {
    errorMessage = fieldInfo.errorMsg || `Please enter a valid ${fieldInfo.name}.`;
  }

  if (errorMessage !== '') {
    inputElement.setAttribute('aria-invalid', 'true');
    if (errorSpan) {
      errorSpan.textContent = errorMessage;
    }
    return false;
  } else {
    inputElement.setAttribute('aria-invalid', 'false');
    if (errorSpan) {
      errorSpan.textContent = '';
    }
    return true;
  }
}

/**
 * Helper to prevent HTML injection in success messages
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
