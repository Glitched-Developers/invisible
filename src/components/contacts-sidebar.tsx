import { memo } from "react";
import { Ban, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarDataUri } from "../lib/avatar";
import type { UserProfile } from "../lib/profile";
import { cn } from "@/lib/utils";
import { BadgeStack } from "./profile-badges";

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
  profile?: UserProfile;
}

interface ContactItemProps {
  contact: Contact;
  selectedContactId: string | null;
  action?: string;
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onBlockContact: (contactId: string) => void;
  language?: "ru" | "en";
  t: (key: string) => string;
}

const ContactItem = memo(
  ({
    contact,
    selectedContactId,
    action,
    onSelectContact,
    onDeleteContact,
    onBlockContact,
    language = "ru",
    t,
  }: ContactItemProps) => {
    const getActionText = (value: string) => {
      switch (value) {
        case "typing":
          return t("typing");
        case "uploading":
          return t("uploadingStatus");
        case "recording":
          return t("recordingStatus");
        default:
          return "";
      }
    };

    const actionText = action ? getActionText(action) : "";
    const isSelected = selectedContactId === contact.id;

    return (
      <div className="group relative">
        <button
          type="button"
          onClick={() => onSelectContact(contact.id)}
          className={cn(
            "relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition duration-200",
            isSelected
              ? "bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-transparent ring-1 ring-violet-400/20"
              : "hover:bg-foreground/[0.04]",
          )}
        >
          {isSelected && (
            <span className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          )}

          <div className="relative shrink-0">
            <Avatar className="h-11 w-11 ring-2 ring-foreground/5">
              <AvatarImage
                src={contact.avatar || avatarDataUri(contact.name)}
                alt={contact.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-semibold text-white">
                {contact.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {contact.online && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-sidebar bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    isSelected ? "text-foreground" : "text-foreground/90",
                  )}
                >
                  {contact.name}
                </span>
                <BadgeStack profile={contact.profile} language={language} limit={2} />
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground/60">
                {contact.timestamp}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <p
                className={cn(
                  "truncate text-xs",
                  actionText
                    ? "text-violet-600 dark:text-violet-300"
                    : "text-muted-foreground/70",
                )}
              >
                {actionText || contact.lastMessage}
              </p>
              {!!contact.unread && contact.unread > 0 && (
                <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 px-1.5 text-[10px] font-bold text-white shadow-glow-sm">
                  {contact.unread}
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBlockContact(contact.id);
            }}
            className="rounded-lg bg-black/40 p-1.5 text-muted-foreground backdrop-blur-md transition hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-300"
            aria-label={t("block")}
            title={t("block")}
          >
            <Ban className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteContact(contact.id);
            }}
            className="rounded-lg bg-black/40 p-1.5 text-muted-foreground backdrop-blur-md transition hover:bg-foreground/10 hover:text-foreground"
            aria-label={t("deleteContact")}
            title={t("deleteContact")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  },
);

ContactItem.displayName = "ContactItem";

interface ContactsSidebarProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onBlockContact: (contactId: string) => void;
  contactActions?: Record<string, string>;
  language?: "ru" | "en";
  t: (key: string) => string;
}

export function ContactsSidebar({
  contacts,
  selectedContactId,
  onSelectContact,
  onDeleteContact,
  onBlockContact,
  contactActions = {},
  language = "ru",
  t,
}: ContactsSidebarProps) {
  if (contacts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/5 text-2xl">
          👻
        </div>
        <p className="text-sm font-medium text-foreground">{t("noContactsTitle")}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t("noContactsText")}
        </p>
      </div>
    );
  }

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="space-y-1">
        {contacts.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            selectedContactId={selectedContactId}
            action={contactActions[contact.id]}
            onSelectContact={onSelectContact}
            onDeleteContact={onDeleteContact}
            onBlockContact={onBlockContact}
            language={language}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
