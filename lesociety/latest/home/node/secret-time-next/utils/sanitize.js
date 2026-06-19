/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing user-generated content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS
 * @param {string} dirty - Unsanitized HTML string
 * @param {object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML string
 */
export function sanitizeHtml(dirty, options = {}) {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    const defaultOptions = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
        ...options,
    };

    return DOMPurify.sanitize(dirty, defaultOptions);
}

/**
 * Strip all HTML tags from content
 * @param {string} html - HTML string
 * @returns {string} - Plain text
 */
export function stripHtml(html) {
    if (!html || typeof html !== 'string') {
        return '';
    }

    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

/**
 * React component wrapper for safe HTML rendering
 * Use this instead of dangerouslySetInnerHTML
 */
export function SafeHtml({ html, className = '', tag = 'div', options = {} }) {
    const Tag = tag;
    const sanitized = sanitizeHtml(html, options);

    return (
        <Tag 
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
}

/**
 * Sanitize text for safe display
 * Escapes HTML entities
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

export default {
    sanitizeHtml,
    stripHtml,
    SafeHtml,
    sanitizeText,
};
