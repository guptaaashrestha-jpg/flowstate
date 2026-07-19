const Utils = require('../js/utils');

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate a string starting with fs_', () => {
      const id = Utils.generateId();
      expect(id).toMatch(/^fs_/);
    });

    it('should generate unique IDs', () => {
      const id1 = Utils.generateId();
      const id2 = Utils.generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('getTimeOfDay', () => {
    it('should return a string representing the time of day', () => {
      const time = Utils.getTimeOfDay();
      expect(['morning', 'afternoon', 'evening']).toContain(time);
    });
  });

  describe('escapeHtml', () => {
    it('should escape dangerous HTML characters', () => {
      // Mock document for JSDOM or use a simple regex replacement if no JSDOM
      // Since Utils relies on document, we need a basic polyfill if Jest environment is node
      if (typeof document === 'undefined') {
        global.document = {
          createElement: () => ({
            textContent: '',
            get innerHTML() {
              return this.textContent
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            }
          })
        };
      }
      const escaped = Utils.escapeHtml('<script>alert("XSS")</script>');
      expect(escaped).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON strings', () => {
      const result = Utils.parseJSON('{"test": true}');
      expect(result).toEqual({ test: true });
    });

    it('should extract JSON from markdown code fences', () => {
      const result = Utils.parseJSON('```json\n{"test": true}\n```');
      expect(result).toEqual({ test: true });
    });
  });
});
