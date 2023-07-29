export function truncateString(text: string, max_length = 120) {
  if (text.length <= max_length) {
    return text;
  } else {
    return text.slice(0, max_length - 3) + "...";
  }
}