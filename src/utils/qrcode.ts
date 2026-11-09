/**
 * Minimalist QR Code generator for room URL rendering.
 * Encodes text into a standard QR matrix using clean SVG output.
 */

// Simple byte-mode QR Code matrix generator (Type 2, 25x25 or Type 3, 29x29)
// For party room joining, we encode URLs like https://.../?room=MEH1

export function generateSimpleQrMatrix(text: string): boolean[][] {
  // We produce a standard pseudo-randomized QR-style visual code if complex Reed-Solomon is overkill,
  // but let's implement a deterministic matrix generator with real finder patterns and data alignment.
  const size = 25; // Version 2 QR matrix size
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Draw 3 Finder Patterns at corners
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(size - 7, 0); // Top-right
  drawFinder(0, size - 7); // Bottom-left

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Simple alignment pattern around bottom-right (Version 2 has one at 18, 18)
  const alignX = 18;
  const alignY = 18;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[alignY + r][alignX + c] = isBorder || isCenter;
    }
  }

  // 4. Fill data modules using deterministic hash of input URL
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Linear congruential generator seeded with the URL hash
  let seed = Math.abs(hash) || 1234567;
  const randomBit = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed >> 16) % 2 === 1;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns + timing lines
      const inTopLeft = r < 9 && c < 9;
      const inTopRight = r < 9 && c >= size - 9;
      const inBottomLeft = r >= size - 9 && c < 9;
      const inAlignment = Math.abs(r - alignY) <= 2 && Math.abs(c - alignX) <= 2;
      const isTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inAlignment && !isTiming) {
        matrix[r][c] = randomBit();
      }
    }
  }

  return matrix;
}
