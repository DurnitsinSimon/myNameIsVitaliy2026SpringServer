import 'dotenv/config';
import { PrismaClient, DictionaryType, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@inpad.ru';
  const adminPassword = 'admin123';

  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hash,
      name: 'Администратор',
      role: UserRole.ADMIN,
    },
  });

  console.log(`Админ создан: ${adminEmail} / ${adminPassword}`);

  const dictionaries: { type: DictionaryType; name: string; sortOrder: number }[] = [
    { type: DictionaryType.OBJECT_TYPE, name: 'Жилой комплекс', sortOrder: 1 },
    { type: DictionaryType.OBJECT_TYPE, name: 'Бизнес-центр', sortOrder: 2 },
    { type: DictionaryType.OBJECT_TYPE, name: 'Частный дом', sortOrder: 3 },
    { type: DictionaryType.OBJECT_TYPE, name: 'Общественное здание', sortOrder: 4 },

    { type: DictionaryType.CITY, name: 'Екатеринбург', sortOrder: 1 },
    { type: DictionaryType.CITY, name: 'Москва', sortOrder: 2 },
    { type: DictionaryType.CITY, name: 'Санкт-Петербург', sortOrder: 3 },

    { type: DictionaryType.DESIGN_STAGE, name: 'Эскизный проект', sortOrder: 1 },
    { type: DictionaryType.DESIGN_STAGE, name: 'Проектная документация', sortOrder: 2 },
    { type: DictionaryType.DESIGN_STAGE, name: 'Рабочая документация', sortOrder: 3 },

    { type: DictionaryType.PROJECT_STATUS, name: 'В проекте', sortOrder: 1 },
    { type: DictionaryType.PROJECT_STATUS, name: 'Строится', sortOrder: 2 },
    { type: DictionaryType.PROJECT_STATUS, name: 'Реализован', sortOrder: 3 },

    { type: DictionaryType.INPAD_ROLE, name: 'Генеральный проектировщик', sortOrder: 1 },
    { type: DictionaryType.INPAD_ROLE, name: 'Архитектурный раздел', sortOrder: 2 },
    { type: DictionaryType.INPAD_ROLE, name: 'Авторский надзор', sortOrder: 3 },
  ];

  for (const dict of dictionaries) {
    await prisma.dictionary.upsert({
      where: { type_name: { type: dict.type, name: dict.name } },
      update: {},
      create: dict,
    });
  }

  console.log(`Справочники наполнены: ${dictionaries.length} записей`);
}

main()
  .then(() => console.log('Seed выполнен успешно'))
  .catch((e) => {
    console.error('Ошибка seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());