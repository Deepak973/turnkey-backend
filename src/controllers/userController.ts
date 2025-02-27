import { Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import {
  checkEmailExists,
  checkUsernameExists,
  findUserByEmail,
  findUserById,
  findUserByOrganizationId,
  findUserByUsername,
  registerUser,
  updateUser,
  updateUserByEmail,
} from "../services/user.service";
import dotenv from "dotenv";
import { AuthRequest } from "../types/authRequest";

dotenv.config();

/**
 * @desc Register user
 * @route POST /api/auth/register
 */
export const registerUserController: RequestHandler = async (req, res) => {
  try {
    const {
      email,
      username,
      walletAddress,
      turnkeyOrganizationId,
      turnkeyUserId,
    } = req.body;

    const isVerified = false;
    const isActive = true;
    const hasPasskey = false;

    // Register user in DB
    const user = await registerUser(
      email,
      username,
      walletAddress,
      turnkeyOrganizationId,
      turnkeyUserId,
      isVerified,
      isActive,
      hasPasskey
    );

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    // Set HTTP-only cookie with JWT
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Login user (Set JWT cookie)
 * @route POST /api/auth/login-with-passkey
 */
// export const loginWithPasskeyController: RequestHandler = async (req, res) => {
//   try {
//     const {
//       email,
//       credentialId,
//       clientDataJSON,
//       authenticatorData,
//       signature,
//     } = req.body;

//     // Check for missing fields
//     if (
//       !email ||
//       !credentialId ||
//       !clientDataJSON ||
//       !authenticatorData ||
//       !signature
//     ) {
//       res.status(400).json({ message: "Missing required fields" });
//       return;
//     }

//     // Find user by email
//     const user = await findUserByEmail(email);
//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     const storedCredentialId = user.credentialId;
//     console.log("Stored Credential ID:", clientDataJSON);
//     console.log("Received Credential ID:", credentialId);

//     // Ensure received credentialId matches stored one
//     if (storedCredentialId !== credentialId) {
//       res
//         .status(401)
//         .json({ message: "Credential ID mismatch. Verification failed." });
//       return;
//     }

//     // Call the verification function
//     const isVerified = await verifyUser(email, {
//       credentialId,
//       clientDataJSON,
//       authenticatorData,
//       signature,
//     });

//     if (!isVerified) {
//       res.status(401).json({
//         message: "Verification failed : Please enter correct passkey",
//       });
//       return;
//     }

//     // Generate JWT Token
//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET as string,
//       { expiresIn: "7d" }
//     );

//     // Set HTTP-only cookie with JWT
//     res.cookie("jwt", token, {
//       httpOnly: true,
//       secure: false, // Set to false for development
//       sameSite: "lax",
//       path: "/",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         walletAddress: user.walletAddress,
//       },
//     });
//   } catch (error: any) {
//     console.error("Passkey verification error:", error);
//     res
//       .status(500)
//       .json({ message: "Error verifying user", error: error.message });
//   }
// };

/**
 * @desc Logout user (Clear JWT cookie)
 * @route POST /api/auth/logout
 */
export const logoutUserController: RequestHandler = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * @desc Check if email exists
 * @route POST /api/auth/email-exists
 */
export const emailExistsController: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    const exists = await checkEmailExists(email);
    res.json({ exists });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Check if username exists
 * @route POST /api/auth/username-exists
 */
export const usernameExistsController: RequestHandler = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    const exists = await checkUsernameExists(username);
    res.json({ exists });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get user by username
 * @route GET /api/auth/me-by-username/:username
 */
export const getMeByUsernameController: RequestHandler = async (req, res) => {
  try {
    console.log("Received request for username:", req.params.username);
    const { username } = req.params;
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    const user = await findUserByUsername(username);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get user by ID
 * @route GET /api/auth/me
 */
export const getMeController: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get user by organization ID
 * @route GET /api/auth/me
 */

export const getMeByOrganizationIdController: RequestHandler = async (
  req,
  res
) => {
  try {
    const { organizationId } = req.params;
    if (!organizationId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await findUserByOrganizationId(organizationId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update user details
 * @route PUT /api/auth/me
 */
export const updateUserController: RequestHandler = async (req, res) => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const updatedUser = await updateUser(userId, req.body);
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Generate challenge for passkey
 * @route POST /api/auth/generate-challenge
 */
// export const generateChallengeController: RequestHandler = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       res.status(400).json({ message: "Email is required" });
//       return;
//     }

//     const { challenge, credentialId } = await generateChallenge(email);
//     res.status(200).json({ challenge, credentialId });
//   } catch (error: any) {
//     res
//       .status(500)
//       .json({ message: "Error generating challenge", error: error.message });
//   }
// };

/**
 * @desc Get user by email
 * @route GET /api/auth/get-user-by-email/:email
 */
export const getUserByEmailController: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserNameController: RequestHandler = async (req, res) => {
  try {
    const { email, username, isVerified, hasPasskey } = req.body;

    const updatedUser = await updateUserByEmail(email, {
      username,
      isVerified,
      hasPasskey,
    });
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserPasskeyController: RequestHandler = async (req, res) => {
  try {
    const { email, hasPasskey } = req.body;

    const updatedUser = await updateUserByEmail(email, {
      hasPasskey,
    });
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserByUsernameController: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    const user = await findUserByUsername(username.toLowerCase());
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
