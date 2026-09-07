# Laundry Manager (demo)

Simple Next.js + TypeScript + Prisma demo to track jeans items through phases (dyeing, washing, creation).

Quick run (local, demo uses SQLite):

1. Clone the repo
2. npm install
3. npx prisma generate
4. npx prisma migrate dev --name init
5. npm run seed
6. npm run dev

Open:
- Admin page: http://localhost:3000/admin/items/1  (admin actions use a simple header in the demo code)
- Viewer page: http://localhost:3000/items/1

Notes:
- Authentication is simplified: the admin page's API expects header `x-user-role: admin`. Replace with NextAuth or JWT for production.
- Use Postgres in production by updating `prisma/schema.prisma` datasource.
