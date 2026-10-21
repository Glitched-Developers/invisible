import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ru' | 'en';

interface Translations {
    [key: string]: { ru: string; en: string };
}

const translations: Translations = {
 settings: { ru: "Настройки", en: "Settings" },
 nickname: { ru: "Никнейм", en: "Nickname" },
 save: { ru: "Сохранить", en: "Save" },
 theme: { ru: "Тема", en: "Theme" },
 lightMode: { ru: "Светлая", en: "Light" },
 darkMode: { ru: "Тёмная", en: "Dark" },
 language: { ru: "Язык", en: "Language" },
 copy: { ru: "Копировать", en: "Copy" },
 copied: { ru: "Скопировано", en: "Copied" },
 deviceId: { ru: "Device ID", en: "Device ID" },
 online: { ru: "В сети", en: "Online" },
 offline: { ru: "Не в сети", en: "Offline" },
 enterDeviceId: { ru: "Введите ID собеседника", en: "Enter recipient ID" },
 typeMessage: { ru: "Сообщение...", en: "Message..." },
 send: { ru: "Отправить", en: "Send" },
 add: { ru: "Добавить", en: "Add" },
 chats: { ru: "Чаты", en: "Chats" },
 file: { ru: "Файл", en: "File" },
 download: { ru: "Скачать", en: "Download" },
 uploadingFile: { ru: "Отправка файла...", en: "Uploading..." },
 loading: { ru: "Загрузка...", en: "Loading..." },
 logout: { ru: "Выйти", en: "Logout" },
 avatar: { ru: "Аватар", en: "Avatar" },
 uploadAvatar: { ru: "Загрузить", en: "Upload" },
 blockedUsers: { ru: "Заблокированные пользователи", en: "Blocked users" },
 noBlockedUsers: { ru: "Нет заблокированных", en: "No blocked users" },
 unblock: { ru: "Разблокировать", en: "Unblock" },
 block: { ru: "Заблокировать", en: "Block" },
 welcomeSubtitle: { ru: "Ваш приватный мессенджер", en: "Your private messenger" },
 start: { ru: "Начать", en: "Start" },
 selectAuthMode: { ru: "Выберите способ входа", en: "Select login method" },
 myServer: { ru: "Cервер (Device ID)", en: "My server (Device ID)" },
 colleagueServer: { ru: "Сервер (логин/пароль)", en: "Colleague's server (login/password)" },
 switchMode: { ru: "Сменить способ подключения", en: "Switch connection method" },
 enterDeviceIdPlaceholder: { ru: "Введите ID устройства", en: "Enter device ID" },
 selectChat: { ru: "Выберите чат для начала общения", en: "Select a conversation to start messaging" },
 deleteContact: { ru: "Удалить контакт", en: "Delete contact" },
 microphoneError: { ru: "Не удалось получить доступ к микрофону", en: "Could not access microphone" },
 profile: { ru: "Профиль", en: "Profile" },
 appearance: { ru: "Внешность", en: "Appearance" },
 privacy: { ru: "Приватность", en: "Privacy" },
 keys: { ru: "Ключи", en: "Keys" },
 backupKeys: { ru: "Резервная копия ключей", en: "Key backup" },
 exportKeys: { ru: "Экспортировать ключи", en: "Export keys" },
 importKeys: { ru: "Импортировать ключи", en: "Import keys" },
 enterExportPassword: { ru: "Пароль для экспорта", en: "Export password" },
 enterImportPassword: { ru: "Пароль для импорта", en: "Import password" },
 password: { ru: "Пароль", en: "Password" },
 cancel: { ru: "Отмена", en: "Cancel" },
 confirm: { ru: "Подтвердить", en: "Confirm" },
 saved: { ru: "Сохранено", en: "Saved" },
 changeAvatar: { ru: "Сменить аватар", en: "Change avatar" },
 avatarHint: { ru: "JPG, PNG или WebP. До 2 МБ.", en: "JPG, PNG or WebP. Up to 2 MB." },
 nicknameHint: { ru: "Так вас увидят собеседники.", en: "This is how others see you." },
 themeHint: { ru: "Тёмная тема создана для долгих разговоров.", en: "The dark theme is made for long conversations." },
 languageHint: { ru: "Интерфейс и системные подписи.", en: "Interface and system labels." },
 privacyHint: { ru: "Список людей, которым закрыт доступ к вам.", en: "People who cannot reach you." },
 keysHint: { ru: "Ключи создаются и хранятся только на этом устройстве.", en: "Keys are generated and stored only on this device." },
 keyWarning: { ru: "Никому не передавайте приватный ключ и пароль резервной копии.", en: "Never share your private key or backup password." },
 localOnly: { ru: "Только на устройстве", en: "Device only" },
 e2eeEnabled: { ru: "Сквозное шифрование включено", en: "End-to-end encryption is on" },
 emptyChatTitle: { ru: "Тишина — это тоже приватность", en: "Silence is privacy too" },
 demoBanner: { ru: "Демо-режим: сообщения не отправляются в сеть, ключи не создаются.", en: "Demo mode: messages are not sent, keys are not created." },
 noContactsTitle: { ru: "Пока никого нет", en: "No contacts yet" },
 noContactsText: { ru: "Добавь контакт по Device ID — и начни приватный разговор.", en: "Add a contact by Device ID to start a private conversation." },
 typing: { ru: "печатает...", en: "typing..." },
 uploadingStatus: { ru: "загружает файл...", en: "uploading file..." },
 recordingStatus: { ru: "записывает аудио...", en: "recording audio..." },
 voiceMessage: { ru: "Голосовое сообщение", en: "Voice message" },
 recording: { ru: "Идёт запись", en: "Recording" },
 sendVoice: { ru: "Отправить голосовое", en: "Send voice message" },
 deleteRecording: { ru: "Удалить запись", en: "Delete recording" },
 recordingTooShort: { ru: "Запись слишком короткая", en: "Recording is too short" },
 microphoneUnsupported: { ru: "Микрофон недоступен в этом окружении", en: "Microphone is not available here" },
 keysLocal: { ru: "Ключи локально", en: "Keys local" },
 backupFileHint: { ru: "JSON-файл резервной копии", en: "JSON backup file" },
 publicProfile: { ru: "Публичный профиль", en: "Public profile" },
 profilePreview: { ru: "Предпросмотр профиля", en: "Profile preview" },
 profilePreviewHint: { ru: "Так вас увидят собеседники в чатах и карточке профиля.", en: "This is how contacts see you in chats and on your profile card." },
 profileVisibility: { ru: "Профиль виден собеседникам", en: "Profile visible to contacts" },
 profileLocalOnly: { ru: "Профиль хранится на этом устройстве", en: "Profile stored on this device" },
 bio: { ru: "О себе", en: "About" },
 bioHint: { ru: "Коротко о вас. До 120 символов.", en: "A few words about you. Up to 120 characters." },
 bioPlaceholder: { ru: "Люблю тишину, неон и сквозное шифрование…", en: "Into silence, neon and end-to-end encryption…" },
 status: { ru: "Статус", en: "Status" },
 statusHint: { ru: "Эмодзи и короткая подпись рядом с именем.", en: "An emoji and a short line next to your name." },
 statusPlaceholder: { ru: "Например: в невидимости", en: "e.g. off the grid" },
 statusEmoji: { ru: "Эмодзи статуса", en: "Status emoji" },
 profileCustomization: { ru: "Кастомизация профиля", en: "Profile customization" },
 profileCustomizationHint: { ru: "Баннер, эффект и ободок аватара — как в Discord, но по-своему.", en: "Banner, effect and avatar frame — Discord-like, but ours." },
 livePreview: { ru: "Живой предпросмотр", en: "Live preview" },
 banner: { ru: "Баннер", en: "Banner" },
 bannerHint: { ru: "Фон и узор верхней части карточки.", en: "Background and pattern for the top of your card." },
 profileEffect: { ru: "Эффект профиля", en: "Profile effect" },
 profileEffectHint: { ru: "Анимация поверх всей карточки профиля.", en: "An animation across the whole profile card." },
 avatarDecoration: { ru: "Ободок аватара", en: "Avatar decoration" },
 avatarDecorationHint: { ru: "Рамка вокруг аватара — видна в профиле и настройках.", en: "A frame around your avatar, shown on the profile." },
 badges: { ru: "Значки", en: "Badges" },
 badgesHint: { ru: "Выберите до 3 значков для профиля.", en: "Pick up to 3 badges for your profile." },
 commonBadges: { ru: "Обычные", en: "Standard" },
 exclusiveBadges: { ru: "Эксклюзивные", en: "Exclusive" },
 badgeLimit: { ru: "Можно выбрать не больше 3 значков", en: "You can choose up to 3 badges" },
 saveProfile: { ru: "Сохранить профиль", en: "Save profile" },
 profileSaved: { ru: "Профиль обновлён", en: "Profile updated" },
 about: { ru: "О себе", en: "About" },
 noBio: { ru: "Пока без описания — но это легко исправить.", en: "No bio yet — easy to fix." },
 noBadges: { ru: "Значки пока не выбраны", en: "No badges selected yet" },
 myProfile: { ru: "Мой профиль", en: "My profile" },
 viewProfile: { ru: "Открыть профиль", en: "View profile" },
 editProfile: { ru: "Редактировать профиль", en: "Edit profile" },
 close: { ru: "Закрыть", en: "Close" },
};

interface LanguageContextType {
    language: Language;
    t: (key: string) => string;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem("language");
        return saved === "en" ? "en" : "ru";
    });

    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);

    const t = (key: string): string => {
        const entry = translations[key];
        if (!entry) return key;
        return entry[language];
    };

    const toggleLanguage = () => {
        setLanguage(prev => (prev === "ru" ? "en" : "ru"));
    };

    return (
        <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}