import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const catalog: Record<
  string,
  { title: string; author: string; publishedYear: number }[]
> = {
  'Classic Fiction': [
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', publishedYear: 1960 },
    { title: 'Nineteen Eighty-Four', author: 'George Orwell', publishedYear: 1949 },
    { title: 'Pride and Prejudice', author: 'Jane Austen', publishedYear: 1813 },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publishedYear: 1925 },
  ],
  'Science Fiction': [
    { title: 'Dune', author: 'Frank Herbert', publishedYear: 1965 },
    { title: 'Neuromancer', author: 'William Gibson', publishedYear: 1984 },
    { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', publishedYear: 1969 },
    { title: 'Foundation', author: 'Isaac Asimov', publishedYear: 1951 },
  ],
  'African Literature': [
    { title: 'Things Fall Apart', author: 'Chinua Achebe', publishedYear: 1958 },
    { title: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong’o', publishedYear: 1964 },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', publishedYear: 2006 },
    { title: 'Petals of Blood', author: 'Ngũgĩ wa Thiong’o', publishedYear: 1977 },
  ],
  'Non-Fiction': [
    { title: 'Sapiens', author: 'Yuval Noah Harari', publishedYear: 2011 },
    { title: 'Educated', author: 'Tara Westover', publishedYear: 2018 },
    { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', publishedYear: 2010 },
  ],
  Technology: [
    { title: 'Clean Code', author: 'Robert C. Martin', publishedYear: 2008 },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt and David Thomas', publishedYear: 1999 },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', publishedYear: 2017 },
  ],
};

async function main() {
  let bookCount = 0;

  for (const [genreName, books] of Object.entries(catalog)) {
    // upsert makes the seed safe to run more than once
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });

    for (const book of books) {
      await prisma.book.upsert({
        where: { title_author: { title: book.title, author: book.author } },
        update: {},
        create: { ...book, genreId: genre.id, copiesAvailable: 3 },
      });
      bookCount++;
    }
  }

  // Two sample users, one per role (example.com addresses are not real people)
  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: { email: 'librarian@example.com', name: 'Sample Librarian', role: Role.LIBRARIAN },
  });
  await prisma.user.upsert({
    where: { email: 'patron@example.com' },
    update: {},
    create: { email: 'patron@example.com', name: 'Sample Patron', role: Role.PATRON },
  });

  console.log(`Seeded ${Object.keys(catalog).length} genres and ${bookCount} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
