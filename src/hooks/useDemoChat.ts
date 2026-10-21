import { useCallback, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "../contexts/LanguageContext";
import type { Contact, Message } from "./useMyServerChat";
import { DEMO_DEVICE_ID, DEMO_MY_PROFILE, DEMO_NICKNAME, demoBlocked, demoContacts, demoMessages } from "../lib/demoData";
import { avatarDataUri } from "../lib/avatar";
import { createDefaultProfile, loadProfile, saveProfile, type UserProfile } from "../lib/profile";
import { base64ToArrayBuffer, arrayBufferToBase64, type EncryptedPackage } from "../lib/crypto";

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function useDemoChat(onSwitchMode: () => void) {
  const { theme, setTheme } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  const [myProfile, setMyProfile] = useState<UserProfile>(() =>
    loadProfile(DEMO_DEVICE_ID, DEMO_MY_PROFILE),
  );
  const [myNickname, setMyNickname] = useState(() => myProfile.nickname || DEMO_NICKNAME);
  const [myAvatar, setMyAvatar] = useState<string | null>(() => myProfile.avatar);
  const [recipientId, setRecipientId] = useState<string | null>(demoContacts[0]?.id ?? null);
  const [contacts, setContacts] = useState<Contact[]>(demoContacts);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(demoMessages);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contactInput, setContactInput] = useState("");
  const [blockedList, setBlockedList] = useState<string[]>(demoBlocked);
  const [contactActions, setContactActions] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const appendMessage = useCallback((contactId: string, message: Message, preview: string) => {
    setMessagesMap((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), message],
    }));
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              lastMessage: preview,
              timestamp: message.time,
              unread: 0,
            }
          : contact,
      ),
    );
  }, []);

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!recipientId || !text.trim() || isSending) return;
      setIsSending(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 180));
        const message: Message = {
          id: `demo-${Date.now()}`,
          senderId: DEMO_DEVICE_ID,
          type: "text",
          content: text.trim(),
          time: nowTime(),
          date: "Сегодня",
        };
        appendMessage(recipientId, message, text.trim());
      } finally {
        setIsSending(false);
      }
    },
    [appendMessage, isSending, recipientId],
  );

  const sendFileMessage = useCallback(
    async (file: File, options?: { duration?: number }) => {
      if (!recipientId || isSending) return;
      setIsSending(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 220));
        const isAudio = file.type.startsWith("audio/");
        const encrypted: EncryptedPackage = isAudio
          ? {
              ephemeralPublicKey: {},
              iv: [],
              ciphertext: arrayBufferToBase64(await file.arrayBuffer()),
              unencrypted: true,
            }
          : {
              ephemeralPublicKey: {},
              iv: [],
              ciphertext: "",
              unencrypted: true,
            };
        const localPreviewUrl =
          file.type.startsWith("image/") || isAudio
            ? URL.createObjectURL(file)
            : undefined;
        const message: Message = {
          id: `demo-file-${Date.now()}`,
          senderId: DEMO_DEVICE_ID,
          type: "file",
          fileData: {
            encrypted,
            metadata: {
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size,
              unencrypted: isAudio,
              duration: options?.duration,
            },
          },
          localPreviewUrl,
          time: nowTime(),
          date: "Сегодня",
        };
        appendMessage(
          recipientId,
          message,
          isAudio ? "🎤 Голосовое сообщение" : `📎 ${file.name}`,
        );
      } finally {
        setIsSending(false);
      }
    },
    [appendMessage, isSending, recipientId],
  );

  const handleTyping = useCallback(
    (text: string) => {
      if (!recipientId) return;
      const existing = typingTimers.current[recipientId];
      if (existing) clearTimeout(existing);

      if (!text.trim()) {
        setContactActions((prev) => {
          const next = { ...prev };
          delete next[recipientId];
          return next;
        });
        return;
      }

      setContactActions((prev) => ({
        ...prev,
        [recipientId]: text === "recording" ? "recording" : "typing",
      }));
      typingTimers.current[recipientId] = setTimeout(() => {
        setContactActions((prev) => {
          const next = { ...prev };
          delete next[recipientId];
          return next;
        });
      }, 2200);
    },
    [recipientId],
  );

  const addContact = useCallback(
    async (id: string) => {
      const trimmed = id.trim();
      if (!trimmed || trimmed === DEMO_DEVICE_ID) return;
      if (contacts.some((contact) => contact.id === trimmed)) {
        setRecipientId(trimmed);
        setContactInput("");
        return;
      }

      const name = `Гость ${trimmed.slice(-4)}`;
      const avatar = avatarDataUri(name);
      const contact: Contact = {
        id: trimmed,
        name,
        avatar,
        lastMessage: "Новый контакт",
        timestamp: "сейчас",
        online: true,
        profile: createDefaultProfile(name, avatar, {
          bio: "Новый собеседник в Invisible.",
          statusEmoji: "✨",
          statusText: "только что добавился",
          banner: "ice",
          profileEffect: "none",
          avatarDecoration: "frost",
          badges: ["early"],
        }),
      };
      setContacts((prev) => [...prev, contact]);
      setRecipientId(trimmed);
      setContactInput("");
    },
    [contacts],
  );

  const deleteContact = useCallback(
    (contactId: string) => {
      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      if (recipientId === contactId) setRecipientId(null);
    },
    [recipientId],
  );

  const handleSelectContact = useCallback((contactId: string) => {
    setRecipientId(contactId);
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId ? { ...contact, unread: 0 } : contact,
      ),
    );
  }, []);

  const updateNickname = useCallback(async (newNickname: string) => {
    const trimmed = newNickname.trim();
    if (!trimmed) return;
    setMyNickname(trimmed);
    setMyProfile((prev) => {
      const next = { ...prev, nickname: trimmed };
      saveProfile(DEMO_DEVICE_ID, next);
      return next;
    });
  }, []);

  const updateAvatar = useCallback(async (newAvatar: string) => {
    setMyAvatar(newAvatar);
    setMyProfile((prev) => {
      const next = { ...prev, avatar: newAvatar };
      saveProfile(DEMO_DEVICE_ID, next);
      return next;
    });
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Omit<UserProfile, "nickname" | "avatar">>) => {
      setMyProfile((prev) => {
        const next = { ...prev, ...patch };
        saveProfile(DEMO_DEVICE_ID, next);
        return next;
      });
    },
    [],
  );

  const handleLogout = useCallback(() => {
    onSwitchMode();
  }, [onSwitchMode]);

  const blockContact = useCallback(
    async (contactId: string) => {
      setBlockedList((prev) => (prev.includes(contactId) ? prev : [...prev, contactId]));
      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      if (recipientId === contactId) setRecipientId(null);
    },
    [recipientId],
  );

  const unblockContact = useCallback(async (contactId: string) => {
    setBlockedList((prev) => prev.filter((id) => id !== contactId));
  }, []);

  const handleExportKeys = useCallback(async (_password: string) => {
    alert("Это демо-режим: настоящие ключи здесь не создаются.");
  }, []);

  const handleImportKeys = useCallback(async (_file: File, _password: string) => {
    alert("Это демо-режим: импорт ключей отключён.");
  }, []);

  const downloadDecryptedFile = useCallback(
    async (encryptedData: EncryptedPackage, metadata: { name: string; type: string }) => {
      if (encryptedData.unencrypted && typeof encryptedData.ciphertext === "string" && encryptedData.ciphertext) {
        const blob = new Blob([base64ToArrayBuffer(encryptedData.ciphertext)], {
          type: metadata.type,
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = metadata.name;
        anchor.click();
        URL.revokeObjectURL(url);
        return;
      }
      alert("В демо-режиме файл уже находится на устройстве.");
    },
    [],
  );

  const decryptFileData = useCallback(async (encryptedData: EncryptedPackage): Promise<ArrayBuffer> => {
    if (encryptedData.unencrypted && typeof encryptedData.ciphertext === "string") {
      return base64ToArrayBuffer(encryptedData.ciphertext);
    }
    return new ArrayBuffer(0);
  }, []);

  const messages = recipientId ? messagesMap[recipientId] || [] : [];
  const currentContact = useMemo(
    () => (recipientId ? contacts.find((contact) => contact.id === recipientId) || null : null),
    [contacts, recipientId],
  );
  const currentAction = recipientId ? contactActions[recipientId] : null;
  const isInitialized = true;
  const isInputDisabled = !recipientId || isSending;

  return {
    theme,
    setTheme,
    t,
    toggleLanguage,
    language,

    myDeviceId: DEMO_DEVICE_ID,
    myNickname,
    myAvatar,
    myProfile,
    recipientId,
    messages,
    contacts,
    isSettingsOpen,
    setIsSettingsOpen,
    contactInput,
    setContactInput,
    blockedList,
    isInitialized,
    isInputDisabled,

    currentContact,
    currentAction,
    contactActions,

    startRegistration: async () => {},
    sendTextMessage,
    sendFileMessage,
    handleTyping,
    addContact,
    deleteContact,
    handleSelectContact,
    updateNickname,
    updateAvatar,
    updateProfile,
    handleLogout,
    blockContact,
    unblockContact,
    handleExportKeys,
    handleImportKeys,
    downloadDecryptedFile,
    decryptFileData,
  };
}
