import dotenv from "dotenv";

dotenv.config();

const ENVIA_API_KEY = process.env.ENVIA_API_KEY || "";
const ENVIA_SANDBOX_BASE_URL =
  process.env.ENVIA_SANDBOX_BASE_URL || "https://api-test.envia.com/";

export { ENVIA_API_KEY, ENVIA_SANDBOX_BASE_URL };
