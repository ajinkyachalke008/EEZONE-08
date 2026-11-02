export interface ComponentTerminalPosition {
  id: string;
  label?: string;
  x: number;
  y: number;
}

/** Rotate canvas pins around the same center used by the component symbol. */
export function rotateTerminalPositions<T extends ComponentTerminalPosition>(
  terminals: T[],
  rotation: number,
  width: number,
  height: number
): T[] {
  const angle = ((rotation % 360) + 360) % 360;
  if (angle === 0) return terminals;

  const centerX = width / 2;
  const centerY = height / 2;

  return terminals.map(terminal => {
    const dx = terminal.x - centerX;
    const dy = terminal.y - centerY;
    let x: number;
    let y: number;

    if (angle === 90) {
      x = centerX - dy;
      y = centerY + dx;
    } else if (angle === 180) {
      x = centerX - dx;
      y = centerY - dy;
    } else if (angle === 270) {
      x = centerX + dy;
      y = centerY - dx;
    } else {
      const radians = angle * Math.PI / 180;
      x = centerX + Math.cos(radians) * dx - Math.sin(radians) * dy;
      y = centerY + Math.sin(radians) * dx + Math.cos(radians) * dy;
    }

    return { ...terminal, x, y };
  });
}
