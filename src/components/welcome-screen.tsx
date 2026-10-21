import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Fingerprint,
  Ghost,
  LockKeyhole,
  Moon,
  Play,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "../contexts/LanguageContext";
import { avatarDataUri } from "../lib/avatar";
import { cn } from "../lib/utils";

type WelcomeVariant = "main" | "register";

interface WelcomeScreenProps {
  variant?: WelcomeVariant;
  onStart: () => void;
  onDemo?: () => void;
  onColleague?: () => void;
  onBack?: () => void;
}

const COPY = {
  ru: {
    badge: "Приватность по умолчанию",
    badgeRegister: "Ключи создаются локально",
    headline: ["Общайся так,", "будто тебя нет."],
    headlineRegister: ["Создай профиль.", "Останься невидимым."],
    description:
      "Invisible — мессенджер, где шифрование живёт на твоём устройстве. Даже сервер не знает, о чём вы говорите.",
    descriptionRegister:
      "Пара ключей создастся прямо на этом устройстве. Приватный ключ не отправится на сервер — только публичная часть.",
    features: [
      { title: "E2EE", text: "Ключи только у тебя" },
      { title: "Без слежки", text: "Ни профилей, ни логов" },
      { title: "Живо", text: "Мгновенная доставка" },
    ],
    primary: "Начать",
    registerPrimary: "Создать профиль",
    demo: "Демо-режим",
    colleague: "У меня есть аккаунт",
    back: "Назад",
    demoHint: "Демо ничего не отправляет в сеть",
    quote: "Приватность — это не секретность. Это контроль.",
    quoteSource: "Invisible Manifesto",
    mockMessages: [
      "Привет! Это демо-режим 👋",
      "Тут можно потрогать новый интерфейс.",
      "Сообщения остаются на устройстве.",
    ],
    online: "в сети",
    input: "Сообщение...",
    keys: "Ключи не покидают устройство",
  },
  en: {
    badge: "Privacy by default",
    badgeRegister: "Keys are generated locally",
    headline: ["Talk like", "you don't exist."],
    headlineRegister: ["Create a profile.", "Stay invisible."],
    description:
      "Invisible is a messenger where encryption lives on your device. Even the server never knows what you talk about.",
    descriptionRegister:
      "A key pair is generated on this device. The private key never reaches the server — only the public part.",
    features: [
      { title: "E2EE", text: "Keys stay with you" },
      { title: "No tracking", text: "No profiles, no logs" },
      { title: "Instant", text: "Real-time delivery" },
    ],
    primary: "Get started",
    registerPrimary: "Create profile",
    demo: "Demo mode",
    colleague: "I already have an account",
    back: "Back",
    demoHint: "Demo does not send anything to the network",
    quote: "Privacy is not secrecy. It is control.",
    quoteSource: "Invisible Manifesto",
    mockMessages: [
      "Hey! This is demo mode 👋",
      "You can try the new interface here.",
      "Messages stay on your device.",
    ],
    online: "online",
    input: "Message...",
    keys: "Keys never leave your device",
  },
} as const;

export function WelcomeScreen({
  variant = "main",
  onStart,
  onDemo,
  onColleague,
  onBack,
}: WelcomeScreenProps) {
  const { language, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const copy = COPY[language];
  const isRegister = variant === "register";

  const headlines = useMemo(
    () => (isRegister ? copy.headlineRegister : copy.headline),
    [copy, isRegister],
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div
          className="aurora left-[-12%] top-[-18%] h-[42rem] w-[42rem] bg-violet-500/30"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="aurora right-[-16%] top-[6%] h-[34rem] w-[34rem] bg-cyan-400/20"
          style={{ animationDelay: "-9s" }}
        />
        <div
          className="aurora bottom-[-24%] left-[28%] h-[38rem] w-[38rem] bg-fuchsia-500/20"
          style={{ animationDelay: "-13s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-glow">
            <Ghost className="h-6 w-6 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-foreground/90">
              INVISIBLE
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              private messenger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-xl transition hover:border-foreground/20 hover:bg-foreground/10 hover:text-foreground"
            aria-label="Toggle language"
          >
            {language === "ru" ? "EN" : "RU"}
          </button>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl border border-foreground/10 bg-foreground/5 p-2.5 text-muted-foreground backdrop-blur-xl transition hover:border-foreground/20 hover:bg-foreground/10 hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-10 sm:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {isRegister ? copy.badgeRegister : copy.badge}
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {headlines[0]}
              <br />
              <span className="text-gradient">{headlines[1]}</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {isRegister ? copy.descriptionRegister : copy.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {copy.features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-foreground/[0.08] bg-foreground/[0.035] p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-foreground/[0.06]"
                  style={{ animationDelay: `${120 + index * 80}ms` }}
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-400/20 text-violet-700 dark:text-violet-200 ring-1 ring-foreground/10">
                    {index === 0 ? (
                      <LockKeyhole className="h-4 w-4" />
                    ) : index === 1 ? (
                      <Fingerprint className="h-4 w-4" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onStart}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_56px_-12px_rgba(139,92,246,0.85)] active:translate-y-0"
              >
                {isRegister ? copy.registerPrimary : copy.primary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>

              {!isRegister && onDemo && (
                <button
                  type="button"
                  onClick={onDemo}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-6 py-3.5 text-sm font-semibold text-foreground/90 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-foreground/10"
                >
                  <Play className="h-4 w-4" />
                  {copy.demo}
                </button>
              )}

              {!isRegister && onColleague && (
                <button
                  type="button"
                  onClick={onColleague}
                  className="text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                >
                  {copy.colleague}
                </button>
              )}

              {isRegister && onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-6 py-3.5 text-sm font-semibold text-foreground/90 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-foreground/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {copy.back}
                </button>
              )}
            </div>

            <p className="mt-4 text-xs text-muted-foreground/60">
              {isRegister ? copy.keys : copy.demoHint}
            </p>
          </section>

          <section className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:140ms]">
            <div className="absolute -inset-6 rounded-[2.75rem] bg-gradient-to-br from-violet-500/25 via-transparent to-cyan-400/20 blur-3xl" />

            <div className="relative glass neon-border rounded-[2rem] p-6">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarDataUri("Алиса Ветрова")}
                    alt="Алиса"
                    className="h-11 w-11 rounded-full ring-2 ring-foreground/10"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Алиса Ветрова</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{copy.online}</p>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-400/10 p-2 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-400/20">
                  <LockKeyhole className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="max-w-[86%] rounded-2xl rounded-tl-md border border-foreground/[0.08] bg-foreground/[0.06] px-4 py-3 text-sm leading-relaxed text-foreground/90 backdrop-blur-xl">
                  {copy.mockMessages[0]}
                </div>
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-gradient-to-br from-violet-500 to-indigo-500 px-4 py-3 text-sm leading-relaxed text-white shadow-glow-sm">
                  {copy.mockMessages[1]}
                </div>
                <div className="max-w-[72%] rounded-2xl rounded-tl-md border border-foreground/[0.08] bg-foreground/[0.06] px-4 py-3 text-sm leading-relaxed text-foreground/90 backdrop-blur-xl">
                  {copy.mockMessages[2]}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-foreground/10 bg-black/20 px-4 py-3">
                <span className="text-sm text-muted-foreground/80">{copy.input}</span>
                <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/70">
                <Fingerprint className="h-3.5 w-3.5" />
                {copy.keys}
              </div>
            </div>

            <div className="absolute -left-12 top-28 hidden animate-float items-center gap-2 rounded-2xl border border-foreground/10 bg-black/50 px-3 py-2 text-xs font-medium text-foreground/90 backdrop-blur-xl sm:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              E2EE
            </div>
            <div className="absolute -right-12 top-28 hidden animate-float items-center gap-2 rounded-2xl border border-foreground/10 bg-black/50 px-3 py-2 text-xs font-medium text-foreground/90 backdrop-blur-xl [animation-delay:1.6s] sm:flex">
              <Fingerprint className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
              0 logs
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 pb-6 text-center">
        <p className="text-xs italic text-muted-foreground/60">«{copy.quote}»</p>
        <p className={cn("mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40")}>
          {copy.quoteSource}
        </p>
      </footer>
    </div>
  );
}
