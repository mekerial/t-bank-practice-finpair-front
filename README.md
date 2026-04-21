# FinPair Frontend

**FinPair Frontend** — клиентская часть приложения для совместного управления финансами пары.

Приложение реализовано как SPA на **React** и **TypeScript** и работает с backend API FinPair. Frontend отвечает за отображение финансового состояния пары, управление транзакциями, аналитику, цели, настройки и раздел поддержки 

## Назначение проекта

Основная задача frontend-приложения — предоставить удобный интерфейс для совместного учета финансов пары.

Приложение позволяет:

- регистрироваться и входить в систему;
- подключать партнёра по инвайт-коду;
- отслеживать доходы, расходы и баланс;
- просматривать аналитику и финансовую нагрузку;
- управлять целями накопления;
- настраивать параметры аккаунта;
- получать доступ к FAQ и поддержке.

## Стек

В проекте используются:

- React;
- TypeScript;
- Vite;
- React Router DOM;
- ESLint;
- Prettier;
- REST API;
- Docker.


## Архитектура проекта

Проект построен как SPA-приложение с модульной структурой. В качестве подхода к организации кода используется feature-based структура с разделением на страницы, бизнес-функции, сущности и общие переиспользуемые модули 

Такой подход хорошо подходит для React-приложения среднего размера и выше, потому что:
- упрощает масштабирование;
- делает код более понятным;
- позволяет переиспользовать общие модули;
- разделяет UI, конфигурацию и бизнес-логику.

## Структура репозитория

```text
t-bank-practice-finpair-front-dev/
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── README.2.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── node_modules/
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── vite-env.d.ts
    ├── app/
    │   ├── providers/
    │   ├── router/
    │   │   └── AppRouter.tsx
    │   └── styles/
    │       └── index.css
    ├── pages/
    │   ├── auth/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   └── auth.css
    │   ├── dashboard/
    │   │   ├── DashboardPage.tsx
    │   │   └── dashboard.css
    │   ├── transactions/
    │   │   ├── TransactionsPage.tsx
    │   │   └── transactions.css
    │   ├── analytics/
    │   │   ├── AnalyticsPage.tsx
    │   │   └── analytics.css
    │   ├── goals/
    │   │   ├── GoalsPage.tsx
    │   │   └── goals.css
    │   ├── settings/
    │   │   ├── SettingsPage.tsx
    │   │   └── settings.css
    │   ├── support/
    │   │   ├── SupportPage.tsx
    │   │   └── support.css
    │   └── NotFoundPage.tsx
    ├── widgets/
    │   └── Layout/
    ├── features/
    ├── entities/
    └── shared/
        ├── api/
        ├── config/
        │   ├── env.ts
        │   └── routes.ts
        ├── constants/
        │   └── app.ts
        ├── lib/
        │   └── mocks.ts
        └── ui/
            ├── Button/
            ├── Card/
            ├── Input/
            ├── PagePlaceholder/
            └── icons.tsx
```

## Конфигурация проекта

В корне проекта находятся основные конфигурационные файлы:

- `vite.config.ts` — конфигурация сборщика Vite;
- `eslint.config.js` — настройки линтинга;
- `.prettierrc` — правила форматирования кода;
- `.prettierignore` — список файлов и папок, которые Prettier не должен форматировать;
- `tsconfig.json` — базовая конфигурация TypeScript;
- `tsconfig.app.json` — конфигурация TypeScript для клиентской части приложения;
- `tsconfig.node.json` — конфигурация TypeScript для Node.js-окружения и служебной части проекта;
- `.env.example` — пример файла переменных окружения.

## Основные модули

### Авторизация и регистрация

- регистрация по email;
- вход в систему;
- подключение партнёра по коду.

### Финансовая нагрузка

- общий доход;
- баланс;
- расчет финансовой нагрузки;
- распределение расходов между партнёрами;
- рекомендации по оптимизации расходов.

### Транзакции

- просмотр списка операций;
- фильтрация по категории, партнёру и дате;
- добавление доходов и расходов.

### Аналитика

- средние расходы;
- крупнейшая категория трат;
- уровень экономии;
- сравнение трат партнёров;
- графики и инсайты.

### Цели

- список финансовых целей;
- общие и индивидуальные цели;
- отображение прогресса;
- остаток до достижения;
- прогноз по срокам.

### Настройки

- редактирование email и дохода;
- выбор валюты;
- управление уведомлениями;
- настройка способа деления расходов;
- получение кода приглашения партнёра.

### Помощь

- FAQ;
- чат поддержки;
- контактная информация.

## Взаимодействие с backend

Frontend работает с отдельным backend-репозиторием `finpair-backend`.

Схема взаимодействия:

```text
Frontend SPA
    |
    v
API Gateway
    |
    +--> AuthService
    +--> CoupleService
    +--> FinanceService
    +--> AnalyticsService
    +--> GoalService
    +--> SupportService
```


## Переменные окружения

В проекте используется файл `.env.example` как шаблон для локальной конфигурации

Пример переменной окружения:

```env
VITE_API_BASE_URL=http://localhost:5000
```


## Сборщик и линтер

В проекте используется **Vite** как сборщик. Он отвечает за запуск dev-сервера, production-сборку и локальный просмотр собранного приложения.

Для проверки и форматирования кода используются:

- **ESLint** — статический анализ и поиск ошибок в коде;
- **Prettier** — единообразное форматирование файлов.

Также проект использует **TypeScript**, поэтому часть контроля качества обеспечивается типизацией и конфигурацией через `tsconfig`-файлы.

## Скрипты

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

- `npm run dev` — запуск dev-сервера;
- `npm run build` — production-сборка проекта;
- `npm run preview` — локальный просмотр production-сборки;
- `npm run lint` — проверка кода ESLint;
- `npm run format` — форматирование кода Prettier.

## Локальный запуск

### Требования

- Node.js;
- npm;
- доступный backend API.

### Установка зависимостей

```bash
npm install
```

### Настройка переменных окружения

Создай локальный файл `.env` на основе `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка проекта

```bash
npm run build
```

### Предпросмотр production-сборки

```bash
npm run preview
```

### Проверка линтером

```bash
npm run lint
```

## Связанные репозитории

- `finpair-frontend` — клиентская часть;
- `finpair-backend` — backend и набор сервисов.