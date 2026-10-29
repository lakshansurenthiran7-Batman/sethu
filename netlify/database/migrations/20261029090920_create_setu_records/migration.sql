CREATE TABLE "setu_records" (
	"collection" text,
	"id" text,
	"data" jsonb NOT NULL,
	CONSTRAINT "setu_records_pkey" PRIMARY KEY("collection","id")
);
