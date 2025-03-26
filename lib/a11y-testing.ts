'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import type React from 'react';

// Utility for accessibility testing in development

// Check for common accessibility issues
export function checkAccessibility(element: HTMLElement): string[] {
  const issues: string[] = [];

  // Check for images without alt text
  const _images = element.querySelectorAll('img');
  _images.forEach((_img, index) => {
    if (!_img.hasAttribute('alt')) {
      issues.push(`Image #${index + 1} is missing alt text`);
    }
  });

  // Check for buttons without accessible names
  const _buttons = element.querySelectorAll('button');
  _buttons.forEach((_button, index) => {
    if (
      !_button.textContent &&
      !_button.getAttribute('aria-label') &&
      !_button.getAttribute('title')
    ) {
      issues.push(`Button #${index + 1} is missing an accessible name`);
    }
  });

  // Check for form elements without labels
  const _formElements = element.querySelectorAll('input, select, textarea');
  _formElements.forEach((_el, index) => {
    const input = _el as HTMLInputElement;
    const id = input.id;

    if (id) {
      const _label = element.querySelector(`label[for="${id}"]`);
      if (!_label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        issues.push(
          `Form element #${index + 1} (${input.type || input.tagName.toLowerCase()}) is missing a label`
        );
      }
    } else {
      issues.push(
        `Form element #${index + 1} (${input.type || input.tagName.toLowerCase()}) is missing an id for label association`
      );
    }
  });

  // Check for proper heading hierarchy
  const _headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  _headings.forEach((_heading, index) => {
    const level = Number.parseInt(_heading.tagName.charAt(1));

    if (index === 0 && level !== 1) {
      issues.push(`First heading is not an h1`);
    }

    if (index > 0 && level > lastLevel + 1) {
      issues.push(`Heading hierarchy skips from h${lastLevel} to h${level}`);
    }

    lastLevel = level;
  });

  return issues;
}

// Hook for accessibility testing in development
export function useA11yTesting(elementRef: React.RefObject<HTMLElement>) {
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const element = elementRef.current;
    if (!element) return;

    // Check for accessibility issues
    const foundIssues = checkAccessibility(element);
    setIssues(foundIssues);

    // Log issues to console
    if (foundIssues.length > 0) {
      console.group('Accessibility Issues');
      foundIssues.forEach((_issue) => console.warn(_issue));
      console.groupEnd();
    }
  }, [elementRef]);

  return issues;
}
