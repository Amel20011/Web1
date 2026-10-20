/**
 * Ban Spesialis Queue Logic
 *
 * Rules:
 * - First verified paid order: #BANDLAB
 * - Subsequent orders: #BANDLAB1, #BANDLAB2, #BANDLAB3...
 * - Queue numbers are permanent once assigned to a paid order.
 */

export function formatQueueNumber(sequenceIndex: number): string {
  if (sequenceIndex < 0) {
    throw new Error('Sequence index must be non-negative');
  }
  if (sequenceIndex === 0) {
    return '#BANDLAB';
  }
  return `#BANDLAB${sequenceIndex}`;
}

export function parseQueueNumber(queueNumber: string): number | null {
  if (!queueNumber || !queueNumber.startsWith('#BANDLAB')) {
    return null;
  }
  const suffix = queueNumber.substring('#BANDLAB'.length);
  if (suffix === '') {
    return 0;
  }
  const parsed = parseInt(suffix, 10);
  return isNaN(parsed) ? null : parsed;
}

export function getNextQueueSequence(existingQueueNumbers: string[]): number {
  let highestSequence = -1;
  for (const qNum of existingQueueNumbers) {
    const seq = parseQueueNumber(qNum);
    if (seq !== null && seq > highestSequence) {
      highestSequence = seq;
    }
  }
  return highestSequence + 1;
}

export function calculateQueuePosition(
  targetQueueNumber: string,
  activeQueueList: { queueNumber?: string; isPriority?: boolean; createdAt: string }[]
): { position: number; aheadCount: number; estimatedMinutes: number } {
  // Filter only items with valid queue numbers
  const validItems = activeQueueList.filter((item) => !!item.queueNumber);

  // Sort by priority first (priority goes first), then by queue sequence number
  const sorted = [...validItems].sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    const seqA = parseQueueNumber(a.queueNumber!) ?? 999999;
    const seqB = parseQueueNumber(b.queueNumber!) ?? 999999;
    return seqA - seqB;
  });

  const index = sorted.findIndex((item) => item.queueNumber === targetQueueNumber);
  if (index === -1) {
    return { position: 1, aheadCount: 0, estimatedMinutes: 20 };
  }

  const aheadCount = index;
  const position = index + 1;
  // Estimate ~30 minutes per order ahead, min 15 mins
  const estimatedMinutes = Math.max(15, aheadCount * 30 + 20);

  return { position, aheadCount, estimatedMinutes };
}
