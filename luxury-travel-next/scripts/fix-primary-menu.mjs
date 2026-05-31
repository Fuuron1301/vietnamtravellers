import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MENU_ID = 'cmp7ue5ty000opnufyctmw0rk';

const newItems = [
  { label: 'Our Tours',   url: '#',        sortOrder: 0 },
  { label: 'All Styles',  url: '#',        sortOrder: 1 },
  { label: 'Travel Blog', url: '/blog/',   sortOrder: 2 },
  { label: 'About Us',    url: '#',        sortOrder: 3 },
  { label: 'Contact Us',  url: '/contact/', sortOrder: 4 },
];

async function main() {
  // Delete all existing items for the primary menu
  await prisma.menuItem.deleteMany({ where: { menuId: MENU_ID } });

  // Insert new items
  for (const item of newItems) {
    await prisma.menuItem.create({
      data: {
        menuId: MENU_ID,
        label: item.label,
        url: item.url,
        sortOrder: item.sortOrder,
        target: '',
        cssClasses: [],
      }
    });
  }

  // Update menu timestamp
  await prisma.menu.update({ where: { id: MENU_ID }, data: { updatedAt: new Date() } });

  console.log('Primary menu updated successfully.');
  const result = await prisma.menu.findUnique({
    where: { id: MENU_ID },
    include: { items: { orderBy: { sortOrder: 'asc' } } }
  });
  console.log(JSON.stringify(result?.items.map(i => `${i.sortOrder}. ${i.label} → ${i.url}`), null, 2));
}

main().finally(() => prisma.$disconnect());
