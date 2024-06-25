const firstNames = ['Sophia', 'Benjamin', 'Ava', 'Ethan', 'Isabella'];
const lastNames = ['Smith', 'Johnson', 'Garcia', 'Martinez', 'Brown'];

export function getRandomName() {
  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * firstNames.length)],
  };
}

export function generateRandomValue(length = 20, prefix = '') {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let value = '';
  for (let i = 0; i < length; i++) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + value;
}

export function generateRandomEmail() {
  const username = generateRandomValue();
  const domain = 'testing';
  const tld = '.com';
  return `${username}@${domain}${tld}`;
}
