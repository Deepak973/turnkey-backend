import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1740567606801 implements MigrationInterface {
    name = 'CreateUserTable1740567606801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "turnkey_organization_id" character varying NOT NULL, "turnkey_user_id" character varying NOT NULL, "wallet_address" character varying NOT NULL, "credential_id" character varying NOT NULL, "public_key" text NOT NULL, "challenge" text NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_23b9db2106e4f409452018f7a76" UNIQUE ("credential_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
