import { validateEmail, validatePassword } from '../utils/validation';

describe('Input Validation Tests', () => {
  describe('Email Validation', () => {
    test('validates correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('validates password meets requirements', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('Abcdefg1')).toBe(true);
    });

    test('rejects weak passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('nouppercase123')).toBe(false);
      expect(validatePassword('NOLOWERCASE123')).toBe(false);
      expect(validatePassword('NoNumbers')).toBe(false);
    });
  });
});