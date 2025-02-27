import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: "turnkey_organization_id" })
  turnkeyOrganizationId!: string;

  @Column({ name: "turnkey_user_id" })
  turnkeyUserId!: string;

  @Column({ name: "wallet_address" })
  walletAddress!: string;

  @Column({ name: "credential_id", unique: true })
  credentialId!: string; // ✅ Stores WebAuthn credential ID

  @Column({ name: "public_key", type: "text" })
  publicKey!: string; // ✅ Stores COSE-encoded public key

  @Column({ name: "challenge", type: "text" })
  challenge!: string; // ✅ Stores challenge for verification

  @Column({ name: "is_verified", default: false })
  isVerified!: boolean;

  @Column({ name: "is_active", default: false })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
