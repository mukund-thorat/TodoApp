BEGIN;

-- Drop existing FK(s) if present. Constraint names can vary by setup/casing.
ALTER TABLE todos DROP CONSTRAINT IF EXISTS "todos_userId_fkey";
ALTER TABLE todos DROP CONSTRAINT IF EXISTS "todos_userid_fkey";

-- Recreate FK with ON DELETE CASCADE so deleting a user removes dependent todos.
ALTER TABLE todos
ADD CONSTRAINT "todos_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES users (id)
ON DELETE CASCADE;

COMMIT;
