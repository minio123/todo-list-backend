import bcrypt from "bcrypt";
import { captureError } from "./sentry.js";

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const pepper = process.env.AUTH_PEPPER;
  try {
    const hashed = await bcrypt.hash(password + pepper, salt);

    if (!hashed) {
      const error = new Error("Password not hashed");
      await captureError(error, {
        extra: {
          action: "util/hashPassword.js -> hashPassword",
        },
      });
      throw error;
    }

    return hashed;
  } catch (error) {
    await captureError(error, {
      extra: {
        action: "util/hashPassword.js -> hashPassword",
      },
    });
    throw error;
  }
};

export default hashPassword;
