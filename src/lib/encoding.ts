import iconv from "iconv-lite";

export function decodeHebrewCp862(input: string): string {
  const decoded = iconv.decode(Buffer.from(input, "binary"), "cp862");
  return decoded.split("").reverse().join("").trim();
}

export function encodeHebrewCp862(input: string, len: number): string {
  const reversed = input.trim().split("").reverse().join("");
  const encodedBuffer = iconv.encode(reversed, "cp862");
  let encoded = encodedBuffer.toString("binary");

  if (encoded.length > len) {
    encoded = encoded.slice(-len);
  }

  return encoded + " ".repeat(Math.max(0, len - encoded.length));
}
