/**
 * Kleiner CLI-Helper zum Erzeugen eines bcrypt-Hashes für das Admin-Passwort.
 * Aufruf: `npm run hash-password -- MeinGeheimesPasswort`
 * oder interaktiv: `npm run hash-password`
 */
import bcrypt from "bcryptjs";
import readline from "node:readline";

async function readPassword(): Promise<string> {
  if (process.argv[2]) return process.argv[2];
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question("Neues Admin-Passwort: ", (a) => { rl.close(); resolve(a); }));
}

async function main() {
  const pw = (await readPassword()).trim();
  if (!pw) { console.error("Passwort darf nicht leer sein."); process.exit(1); }
  const hash = await bcrypt.hash(pw, 12);
  console.log("\nIn .env einfügen:\n");
  console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
}

main();
