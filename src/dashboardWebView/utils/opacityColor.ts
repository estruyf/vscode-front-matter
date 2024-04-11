export const opacityColor = (color: string | undefined, opacity: number) => {
  if (color) {
    if (color.startsWith('#')) {
      return `${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`;
    } else if (color.startsWith('rgba')) {
      const splits = color.split(',');
      splits.pop();
      return `${splits.join(', ')}, ${opacity})`;
    } else if (color.startsWith('rgb')) {
      return `${color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)}`;
    } else {
      return color;
    }
  }

  return color;
};
