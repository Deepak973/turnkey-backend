// user.service.ts
import { User } from "../entities/User";
import { AppDataSource } from "../config/data-source";

const userRepository = AppDataSource.getRepository(User);

export const registerUser = async (
  email: string,
  username: string,
  walletAddress: string,
  turnkeyOrganizationId: string,
  turnkeyUserId: string,
  credentialId: string,
  publicKey: string,
  challenge: string,
  isVerified: boolean = false,
  isActive: boolean = false
) => {
  const existingUser = await userRepository.findOne({ where: { email } });

  if (existingUser) {
    console.log("User already exists");
    throw new Error("User already exists");
  }

  const user = userRepository.create({
    username,
    email,
    walletAddress,
    turnkeyOrganizationId,
    turnkeyUserId,
    credentialId,
    publicKey,
    challenge,
    isVerified,
    isActive,
  });

  await userRepository.save(user);
  return user;
};

export const findUserByEmail = async (email: string) => {
  const userRepo = AppDataSource.getRepository(User);
  return await userRepo.findOneBy({ email });
};

export const checkEmailExists = async (email: string) => {
  const user = await findUserByEmail(email);
  console.log("user", user);
  return !!user;
};

export const checkUsernameExists = async (username: string) => {
  const user = await userRepository.findOneBy({ username });
  console.log("user", user);
  return !!user;
};

export const findUserById = async (id: string) => {
  return await userRepository.findOneBy({ id });
};

export const updateUser = async (id: string, updateData: Partial<User>) => {
  await userRepository.update(id, updateData);
  return await findUserById(id);
};

export const findUserByOrganizationId = async (organizationId: string) => {
  return await userRepository.findOneBy({
    turnkeyOrganizationId: organizationId,
  });
};

export const findUserByUsername = async (username: string) => {
  return await userRepository.findOneBy({ username });
};
