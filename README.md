# Library Management System

A NestJS + Prisma + PostgreSQL API for a library's book catalog.

## Setup

```bash
cd api
npm install
cp .env.example .env          # then put your real DATABASE_URL in .env
npx prisma migrate dev --name init
npx prisma db seed
```

The seed script inserts 5 genres and 18 books, plus one sample librarian and one sample patron. It uses `upsert`, so running it again does not create duplicates.

## Schema Decisions

**Why does `Book` reference `Genre` instead of embedding it?**

PostgreSQL is a relational database, so relationships are expressed with foreign keys rather than by nesting one record inside another. Each genre lives once in the `Genre` table, and each `Book` stores only a `genreId` pointing to it, declared in Prisma with `@relation(fields: [genreId], references: [id])`.

This gives three benefits:

1. **No duplication.** "Science Fiction" is stored once, not repeated on every science fiction book, so there is no risk of spellings like "Sci-Fi" and "Science Fiction" drifting apart.
2. **One place to update.** Renaming or fixing a genre changes a single row, and every book shows the change.
3. **Integrity.** The foreign key makes the database reject a book that points to a genre that does not exist. `onDelete: Restrict` also stops a genre from being deleted while books still use it.

Other choices:

- **`Role` enum (`PATRON`, `LIBRARIAN`)** limits a user's role to two valid values at the database level. New users default to `PATRON`.
- **`@@unique([title, author])` on `Book`** prevents the same book being entered twice and lets the seed script upsert safely.
- **`@@index([genreId])`** speeds up "all books in a genre" queries.
- **`Review` (stretch)** links a user to a book with a rating and comment. `@@unique([bookId, userId])` allows one review per user per book.

### Prisma vs a document database

In a document database such as MongoDB, I would probably have embedded the genre name inside each book document, which is quicker to write but harder to keep consistent. In Prisma, I had to design the relationship up front and use `include: { genre: true }` to bring the data back together, so the structure is stricter, but the data stays clean.
