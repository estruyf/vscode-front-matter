export const darkenColor = (color: string | undefined, percentage: number) => {
  if (!color) {
    return color;
  }

  // Remove any whitespace and convert to lowercase
  color = color.trim().toLowerCase();

  // Check if the color is in hex format
  if (color.startsWith('#')) {
    // Remove the "#" symbol
    color = color.slice(1);

    // Convert the color to rgb format
    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b];
    };

    const [r, g, b] = hexToRgb(color);

    // Calculate the darkened color
    const darkenValue = Math.round(255 * (percentage / 100));
    const darkenedR = Math.max(r - darkenValue, 0);
    const darkenedG = Math.max(g - darkenValue, 0);
    const darkenedB = Math.max(b - darkenValue, 0);

    // Convert the darkened color back to hex format
    const rgbToHex = (r: number, g: number, b: number) => {
      const toHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    return rgbToHex(darkenedR, darkenedG, darkenedB);
  }

  // Check if the color is in rgb or rgba format
  if (color.startsWith('rgb')) {
    // Extract the RGB values
    const rgbValues = color.match(/\d+/g);

    if (rgbValues) {
      const [r, g, b] = rgbValues.map(Number);

      // Calculate the darkened color
      const darkenValue = Math.round(255 * (percentage / 100));
      const darkenedR = Math.max(r - darkenValue, 0);
      const darkenedG = Math.max(g - darkenValue, 0);
      const darkenedB = Math.max(b - darkenValue, 0);

      // Check if the color is in rgba format
      if (color.startsWith('rgba')) {
        // Extract the alpha value
        const alphaMatch = color.match(/[\d\.]+(?=\))/);
        const alpha = alphaMatch ? Number(alphaMatch[0]) : 1;
        console.log('alpha:', alpha);

        return `rgba(${darkenedR}, ${darkenedG}, ${darkenedB}, ${alpha})`;
      }

      return `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
    }
  }

  return color;
};
