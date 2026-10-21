import type { Contact, Message } from "../hooks/useMyServerChat";
import { avatarDataUri } from "./avatar";
import { createDefaultProfile } from "./profile";

export const DEMO_DEVICE_ID = "invisible-demo-7f3a";
export const DEMO_NICKNAME = "Вы";

const alice = {
  id: "alice",
  name: "Алиса Ветрова",
  avatar: avatarDataUri("Алиса Ветрова"),
};

const mark = {
  id: "mark",
  name: "Марк Северов",
  avatar: avatarDataUri("Марк Северов"),
};

const nina = {
  id: "nina",
  name: "Нина Ким",
  avatar: avatarDataUri("Нина Ким"),
};

const team = {
  id: "team-invisible",
  name: "Команда Invisible",
  avatar: avatarDataUri("Команда Invisible"),
};

export const DEMO_MY_PROFILE = createDefaultProfile(DEMO_NICKNAME, avatarDataUri(DEMO_NICKNAME), {
  bio: "Тестирую Invisible и собираю эксклюзивные значки.",
  statusEmoji: "👻",
  statusText: "в невидимости",
  banner: "nebula",
  profileEffect: "aurora",
  avatarDecoration: "neon",
  badges: ["early", "verified", "founder"],
});

export const demoContacts: Contact[] = [
  {
    ...alice,
    lastMessage: "Профиль готов? Включи эксклюзивные значки ✨",
    timestamp: "10:42",
    online: true,
    unread: 2,
    profile: createDefaultProfile(alice.name, alice.avatar, {
      bio: "Дизайню интерфейсы, которые говорят шёпотом.",
      statusEmoji: "🌙",
      statusText: "в потоке",
      banner: "aurora",
      profileEffect: "sparkles",
      avatarDecoration: "holo",
      badges: ["early", "verified", "founder"],
    }),
  },
  {
    ...mark,
    lastMessage: "Сейчас доделаю вкладки профиля и покажу.",
    timestamp: "09:18",
    online: false,
    profile: createDefaultProfile(mark.name, mark.avatar, {
      bio: "Собираю бэкенд и коллекционирую редкие значки.",
      statusEmoji: "⚡",
      statusText: "на созвоне",
      banner: "sunset",
      profileEffect: "scan",
      avatarDecoration: "gold",
      badges: ["crypto", "beta", "first100"],
    }),
  },
  {
    ...nina,
    lastMessage: "Да, waveform и плавное появление уже в плане.",
    timestamp: "Вчера",
    online: true,
    profile: createDefaultProfile(nina.name, nina.avatar, {
      bio: "Голосовые, waveform и немного магии.",
      statusEmoji: "🎧",
      statusText: "слушаю",
      banner: "ice",
      profileEffect: "aurora",
      avatarDecoration: "frost",
      badges: ["night", "early", "ghost"],
    }),
  },
  {
    ...team,
    lastMessage: "Релиз v0.2: стекло, неон и новые анимации.",
    timestamp: "Вчера",
    online: false,
    profile: createDefaultProfile(team.name, team.avatar, {
      bio: "Официальный канал команды Invisible.",
      statusEmoji: "👻",
      statusText: "на связи",
      banner: "royal",
      profileEffect: "holo",
      avatarDecoration: "orbit",
      badges: ["verified", "founder", "legend"],
    }),
  },
];

export const demoMessages: Record<string, Message[]> = {
  [alice.id]: [
    {
      id: "alice-1",
      senderId: alice.id,
      type: "text",
      content: "Привет! Смотри, какой теперь интерфейс ✨",
      time: "10:36",
      date: "Сегодня",
    },
    {
      id: "alice-2",
      senderId: DEMO_DEVICE_ID,
      type: "text",
      content: "Выглядит намного живее. Особенно стекло и свечение.",
      time: "10:38",
      date: "Сегодня",
    },
    {
      id: "alice-3",
      senderId: alice.id,
      type: "text",
      content: "И главное — всё так же шифруется на устройстве. Даже демо не отправляет данные в сеть.",
      time: "10:39",
      date: "Сегодня",
    },
    {
      id: "alice-4",
      senderId: DEMO_DEVICE_ID,
      type: "text",
      content: "Профиль и анимации тоже скоро подъедут. Хочу сделать его красивым, а не просто списком полей.",
      time: "10:41",
      date: "Сегодня",
    },
    {
      id: "alice-5",
      senderId: alice.id,
      type: "text",
      content: "Профиль готов? Включи эксклюзивные значки ✨",
      time: "10:42",
      date: "Сегодня",
    },
  ],
  [mark.id]: [
    {
      id: "mark-1",
      senderId: mark.id,
      type: "text",
      content: "Скинь, пожалуйста, макет профиля, когда будет готов.",
      time: "09:12",
      date: "Сегодня",
    },
    {
      id: "mark-2",
      senderId: DEMO_DEVICE_ID,
      type: "text",
      content: "Сейчас доделаю вкладки профиля и покажу.",
      time: "09:18",
      date: "Сегодня",
    },
  ],
  [nina.id]: [
    {
      id: "nina-1",
      senderId: nina.id,
      type: "text",
      content: "Голосовые тоже будут красивые?",
      time: "18:04",
      date: "Вчера",
    },
    {
      id: "nina-2",
      senderId: DEMO_DEVICE_ID,
      type: "text",
      content: "Да, waveform и плавное появление уже в плане.",
      time: "18:07",
      date: "Вчера",
    },
  ],
  [team.id]: [
    {
      id: "team-1",
      senderId: team.id,
      type: "text",
      content: "Релиз v0.2: стекло, неон и новые анимации.",
      time: "12:00",
      date: "Вчера",
    },
    {
      id: "team-2",
      senderId: DEMO_DEVICE_ID,
      type: "text",
      content: "Красиво. Дальше — профили и умные уведомления.",
      time: "12:03",
      date: "Вчера",
    },
  ],
};

export const demoBlocked: string[] = [];
