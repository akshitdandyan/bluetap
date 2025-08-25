export default function getUniqueRandomId() {
  return crypto.randomUUID();
}

export function getUnique4DigitCode(): string {
  // Generate a random 4-digit number between 1000-9999
  return Math.floor(1000 + Math.random() * 9000).toString();
}
