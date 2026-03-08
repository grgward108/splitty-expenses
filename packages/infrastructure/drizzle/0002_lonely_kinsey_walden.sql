-- user_id を追加（既存行は NULL のまま。新規は必ず設定され、一覧・取得は userId でフィルタする）
ALTER TABLE "tasks" ADD COLUMN "user_id" text;
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;