export const cn = (...classes: Array<string | false | null | undefined>): string => {
  return classes.filter(Boolean).join(' ');
};

export const formatLabel = (value: string): string => {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};
