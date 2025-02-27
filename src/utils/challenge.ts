import { findUserByEmail, updateUser } from "../services/user.service";
import crypto from "crypto";
import base64url from "base64url";
import { Buffer } from "buffer";
import jwkToPem from "jwk-to-pem";

export const generateChallenge = async (
  email: string
): Promise<{ challenge: string; credentialId?: string }> => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate random challenge directly
    const challenge = crypto.randomBytes(32).toString("base64url");
    await updateUser(user.id, { challenge });

    return {
      challenge,
      credentialId: user.credentialId,
    };
  } catch (error: any) {
    console.error("Challenge generation error:", error);
    throw error;
  }
};

/**
 * Verify WebAuthn Assertion
 */
export const verifyUser = async (
  email: string,
  data: {
    credentialId: string;
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
  }
): Promise<boolean> => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      console.error("User not found");
      return false;
    }

    // Parse the stored COSE key
    const coseKey = JSON.parse(user.publicKey);

    // Convert COSE coordinates to JWK format
    const jwk = {
      kty: "EC",
      crv: "P-256",
      x: base64url.encode(Buffer.from(coseKey["-2"].data)),
      y: base64url.encode(Buffer.from(coseKey["-3"].data)),
      ext: true,
    };

    // Convert JWK to PEM
    const pemKey = jwkToPem(jwk as any);

    // Import the public key
    const publicKey = await crypto.subtle.importKey(
      "spki",
      Buffer.from(
        pemKey.replace(/-----BEGIN.*-----|-----END.*-----|\n/g, ""),
        "base64"
      ),
      {
        name: "ECDSA",
        namedCurve: "P-256",
        hash: { name: "SHA-256" },
      } as EcKeyImportParams,
      false,
      ["verify"]
    );

    // Hash the client data
    const clientDataHash = await crypto.subtle.digest(
      "SHA-256",
      Buffer.from(data.clientDataJSON, "base64url")
    );

    // Combine authenticator data and client data hash
    const signedData = Buffer.concat([
      base64url.toBuffer(data.authenticatorData),
      Buffer.from(clientDataHash),
    ]);

    // Convert signature from ASN.1 to raw format
    const signatureBuffer = Buffer.from(data.signature, "base64");
    const rStart = signatureBuffer[4] === 0 ? 5 : 4;
    const rEnd = rStart + 32;
    const sStart = signatureBuffer[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2;
    const r = signatureBuffer.slice(rStart, rEnd);
    const s = signatureBuffer.slice(sStart);
    const rawSignature = Buffer.concat([r, s]);

    // Verify the signature
    const isValid = await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      } as EcdsaParams,
      publicKey,
      rawSignature,
      signedData
    );

    // Verify challenge matches
    const decodedClientData = JSON.parse(
      Buffer.from(data.clientDataJSON, "base64url").toString()
    );
    const challengeMatches = decodedClientData.challenge === user.challenge;

    console.log("Signature Valid:", isValid);
    console.log("Challenge Matches:", challengeMatches);

    return isValid && challengeMatches;
  } catch (error) {
    console.error("Verification error:", error);
    return false;
  }
};
