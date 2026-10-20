import test from 'node:test';
import assert from 'node:assert/strict';
import { formatQueueNumber, parseQueueNumber, getNextQueueSequence, calculateQueuePosition } from './queue-logic.ts';

test('formatQueueNumber generates correct sequence', () => {
  assert.equal(formatQueueNumber(0), '#BANDLAB');
  assert.equal(formatQueueNumber(1), '#BANDLAB1');
  assert.equal(formatQueueNumber(2), '#BANDLAB2');
  assert.equal(formatQueueNumber(10), '#BANDLAB10');
});

test('parseQueueNumber parses sequence integers', () => {
  assert.equal(parseQueueNumber('#BANDLAB'), 0);
  assert.equal(parseQueueNumber('#BANDLAB1'), 1);
  assert.equal(parseQueueNumber('#BANDLAB42'), 42);
  assert.equal(parseQueueNumber('INVALID'), null);
});

test('getNextQueueSequence finds highest sequence + 1', () => {
  assert.equal(getNextQueueSequence([]), 0);
  assert.equal(getNextQueueSequence(['#BANDLAB']), 1);
  assert.equal(getNextQueueSequence(['#BANDLAB', '#BANDLAB1', '#BANDLAB2']), 3);
  assert.equal(getNextQueueSequence(['#BANDLAB', '#BANDLAB5']), 6);
});

test('calculateQueuePosition correctly determines ahead count and position', () => {
  const queueList = [
    { queueNumber: '#BANDLAB', isPriority: false, createdAt: '2026-10-20T00:00:00Z' },
    { queueNumber: '#BANDLAB1', isPriority: true, createdAt: '2026-10-20T01:00:00Z' },
    { queueNumber: '#BANDLAB2', isPriority: false, createdAt: '2026-10-20T02:00:00Z' },
  ];

  // Priority item #BANDLAB1 moves ahead of #BANDLAB
  const resPriority = calculateQueuePosition('#BANDLAB1', queueList);
  assert.equal(resPriority.position, 1);
  assert.equal(resPriority.aheadCount, 0);

  const resSecond = calculateQueuePosition('#BANDLAB', queueList);
  assert.equal(resSecond.position, 2);
  assert.equal(resSecond.aheadCount, 1);

  const resThird = calculateQueuePosition('#BANDLAB2', queueList);
  assert.equal(resThird.position, 3);
  assert.equal(resThird.aheadCount, 2);
});
