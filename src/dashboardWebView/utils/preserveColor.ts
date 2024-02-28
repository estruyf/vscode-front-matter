export const preserveColor = (color: string | undefined) => {
  if (color) {
    if (color.startsWith('#') && color.length > 7) {
      return color.slice(0, 7);
    } else if (color.startsWith('rgba')) {
      const splits = color.split(',');
      splits.pop();
      return `${splits.join(', ')}, 1)`;
    }
  }

  return color;
};
