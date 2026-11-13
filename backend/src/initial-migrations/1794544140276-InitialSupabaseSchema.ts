import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSupabaseSchema1794544140276 implements MigrationInterface {
    name = 'InitialSupabaseSchema1794544140276'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "pricemodel" character varying(50) NOT NULL DEFAULT 'per_kg', "processing_time_hours" integer NOT NULL DEFAULT '24', "is_active" boolean NOT NULL DEFAULT true, "category" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL DEFAULT 'Unknown Customer', "phone" character varying(20) NOT NULL, "email" character varying(100), "address" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "service_id" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000', "service_name" character varying NOT NULL DEFAULT 'Unknown Service', "quantity" numeric(10,2) NOT NULL DEFAULT '0', "weight" numeric(10,2), "price" numeric(10,2) NOT NULL DEFAULT '0', "subtotal" numeric(10,2) NOT NULL DEFAULT '0', "unit_price" numeric(10,2) NOT NULL DEFAULT '0', "total_price" numeric(10,2) NOT NULL DEFAULT '0', "notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('new', 'processing', 'washing', 'drying', 'folding', 'ready', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_number" character varying NOT NULL DEFAULT 'ORD-00000000-00000', "customer_id" uuid NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'new', "total_amount" numeric(10,2) NOT NULL DEFAULT '0', "total_weight" numeric(10,2) NOT NULL DEFAULT '0', "notes" character varying, "special_requirements" character varying, "pickup_date" TIMESTAMP, "delivery_date" TIMESTAMP, "is_delivery_needed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_payment_method_enum" AS ENUM('cash', 'bank_transfer', 'credit_card', 'e_wallet')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_payment_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "payment_method" "public"."payments_payment_method_enum" NOT NULL DEFAULT 'cash', "payment_status" "public"."payments_payment_status_enum" NOT NULL DEFAULT 'pending', "transaction_id" character varying, "reference_number" character varying(50) NOT NULL, "notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "customer_id" uuid, CONSTRAINT "UQ_c6269f7102a646b1d242205641d" UNIQUE ("reference_number"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "daily_job_queues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "scheduled_date" date NOT NULL, "queue_position" integer NOT NULL, "estimated_completion_time" TIMESTAMP, "actual_completion_time" TIMESTAMP, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6f6b1a9671a6f5f48f851f47a0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."work_orders_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."work_orders_current_step_enum" AS ENUM('sorting', 'washing', 'drying', 'folding', 'ironing', 'packaging', 'quality_check')`);
        await queryRunner.query(`CREATE TABLE "work_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "job_queue_id" uuid, "work_order_number" character varying NOT NULL, "status" "public"."work_orders_status_enum" NOT NULL DEFAULT 'pending', "assigned_to" character varying, "priority" integer NOT NULL DEFAULT '3', "start_time" TIMESTAMP, "end_time" TIMESTAMP, "instructions" text, "current_step" "public"."work_orders_current_step_enum" DEFAULT 'sorting', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9be585b8469ddf1965c978d8cec" UNIQUE ("work_order_number"), CONSTRAINT "PK_29f6c1884082ee6f535aed93660" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."work_order_steps_step_type_enum" AS ENUM('sorting', 'washing', 'drying', 'folding', 'ironing', 'packaging', 'quality_check')`);
        await queryRunner.query(`CREATE TYPE "public"."work_order_steps_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'skipped')`);
        await queryRunner.query(`CREATE TABLE "work_order_steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "work_order_id" uuid NOT NULL, "step_type" "public"."work_order_steps_step_type_enum" NOT NULL, "sequence_number" integer NOT NULL, "status" "public"."work_order_steps_status_enum" NOT NULL DEFAULT 'pending', "assigned_to" character varying, "start_time" TIMESTAMP, "end_time" TIMESTAMP, "duration_minutes" integer, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0ab1db514ea990b05bb3828ac61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(50) NOT NULL, "password" character varying(255) NOT NULL, "email" character varying(100) NOT NULL, "name" character varying(100) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'staff', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_4b7bcdfcab38cf99bc8ded5c48a" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d0b02233df1c52323107fe7b4d7" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_job_queues" ADD CONSTRAINT "FK_bde16efb1d6485a4a46d98e2e87" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_orders" ADD CONSTRAINT "FK_1af1389c2b4f8501472b2f814e2" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_orders" ADD CONSTRAINT "FK_ca04689c02841312d39d867549a" FOREIGN KEY ("job_queue_id") REFERENCES "daily_job_queues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_order_steps" ADD CONSTRAINT "FK_0a6038574abbf4a2aacbefdd0fe" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_order_steps" DROP CONSTRAINT "FK_0a6038574abbf4a2aacbefdd0fe"`);
        await queryRunner.query(`ALTER TABLE "work_orders" DROP CONSTRAINT "FK_ca04689c02841312d39d867549a"`);
        await queryRunner.query(`ALTER TABLE "work_orders" DROP CONSTRAINT "FK_1af1389c2b4f8501472b2f814e2"`);
        await queryRunner.query(`ALTER TABLE "daily_job_queues" DROP CONSTRAINT "FK_bde16efb1d6485a4a46d98e2e87"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d0b02233df1c52323107fe7b4d7"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_4b7bcdfcab38cf99bc8ded5c48a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "work_order_steps"`);
        await queryRunner.query(`DROP TYPE "public"."work_order_steps_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."work_order_steps_step_type_enum"`);
        await queryRunner.query(`DROP TABLE "work_orders"`);
        await queryRunner.query(`DROP TYPE "public"."work_orders_current_step_enum"`);
        await queryRunner.query(`DROP TYPE "public"."work_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "daily_job_queues"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_payment_method_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "service_categories"`);
    }

}
