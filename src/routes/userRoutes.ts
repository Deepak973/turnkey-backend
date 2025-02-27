import * as express from "express";
import {
  registerUserController,
  logoutUserController,
  emailExistsController,
  usernameExistsController,
  getMeController,
  updateUserController,
  generateChallengeController,
  loginWithPasskeyController,
  getMeByOrganizationIdController,
  getMeByUsernameController,
  getUserByEmailController,
} from "../controllers/userController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUserController); // register user
router.post("/login-with-passkey", loginWithPasskeyController); // verify passkey
router.post("/email-exists", emailExistsController); //check if email exists
router.post("/username-exists", usernameExistsController); //check if username exists
router.get(
  "/me-by-organization-id/:organizationId",
  getMeByOrganizationIdController
);
router.get("/me-by-username/:username", getMeByUsernameController);
router.get("/get-user-by-email/:email", getUserByEmailController);

router.post("/logout", authMiddleware, logoutUserController); // logout and clear cookies
router.get("/me", authMiddleware, getMeController); // Get own profile
router.put("/me", authMiddleware, updateUserController); // Update own profile
router.post("/generate-challenge", generateChallengeController); // generate challenge

// To Do: Add admin routes if needed
// router.get("/:id", authMiddleware, getUserByIdController); // If needed for admins
// router.put("/:id", authMiddleware, updateUserController);

export default router;
