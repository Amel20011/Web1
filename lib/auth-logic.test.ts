import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, isValidGmail, isValidPin, checkPinRateLimit, registerPinAttempt } from './auth-logic.ts';

test('normalizeEmail lowercases and trims', () => {
  assert.equal(normalizeEmail('  User@GMAIL.COM '), 'user@gmail.com');
});

test('isValidGmail validates only Gmail domains', () => {
  assert.equal(isValidGmail('amelcns8@gmail.com'), true);
  assert.equal(isValidGmail('music.producer+mix@gmail.com'), true);
  assert.equal(isValidGmail('user@yahoo.com'), false);
  assert.equal(isValidGmail('user@company.org'), false);
  assert.equal(isValidGmail('notanemail'), false);
});

test('isValidPin strictly validates 4 digits', () => {
  assert.equal(isValidPin('1234'), true);
  assert.equal(isValidPin('0000'), true);
  assert.equal(isValidPin('0123'), true);
  assert.equal(isValidPin('123'), false);
  assert.equal(isValidPin('12345'), false);
  assert.equal(isValidPin('abcd'), false);
  assert.equal(isValidPin('12 4'), false);
});

test('checkPinRateLimit and registerPinAttempt triggers lock after 5 failures', () => {
  let state = { failedAttempts: 0, lockedUntil: null };
  const baseTime = 1000000;

  for (let i = 0; i < 4; i++) {
    state = registerPinAttempt(state, false, baseTime);
    assert.equal(state.failedAttempts, i + 1);
    const check = checkPinRateLimit(state, baseTime);
    assert.equal(check.allowed, true);
  }

  // 5th attempt locks for 60 seconds
  state = registerPinAttempt(state, false, baseTime);
  assert.equal(state.failedAttempts, 5);
  assert.equal(state.lockedUntil, baseTime + 60000);

  const checkLocked = checkPinRateLimit(state, baseTime + 10000);
  assert.equal(checkLocked.allowed, false);
  assert.equal(checkLocked.remainingLockSeconds, 50);

  // After expiry, allowed is true
  const checkExpired = checkPinRateLimit(state, baseTime + 65000);
  assert.equal(checkExpired.allowed, true);
});
