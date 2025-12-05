import crypto from "crypto";

const PBKDF2_ITERATIONS = 310_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export async function hashPassword(plainPassword: string): Promise<{
  salt: string;
  passwordHash: string;
}> {
  const salt = crypto.randomBytes(16).toString("hex");

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(
      plainPassword,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      DIGEST,
      (err, key) => {
        if (err) return reject(err);
        resolve(key);
      },
    );
  });

  const passwordHash = derivedKey.toString("hex");

  return { salt, passwordHash };
}

export async function verifyPassword(options: {
  plainPassword: string;
  salt: string;
  passwordHash: string;
}): Promise<boolean> {
  const { plainPassword, salt, passwordHash } = options;

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(
      plainPassword,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      DIGEST,
      (err, key) => {
        if (err) return reject(err);
        resolve(key);
      },
    );
  });

  const computedHash = derivedKey.toString("hex");

  // Constant-time comparison to avoid timing attacks
  const a = Buffer.from(computedHash, "hex");
  const b = Buffer.from(passwordHash, "hex");
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}


