import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useMyServerChat } from "./hooks/useMyServerChat";
import { useDemoChat } from "./hooks/useDemoChat";
import { WelcomeScreen } from "./components/welcome-screen";
import { ChatWorkspace } from "./components/chat-workspace";
import { Auth } from "./components/auth/Auth";
import "./styles/globals.css";

type AuthMode = "my" | "colleague" | "demo";

function MyServerChat({ onSwitchMode }: { onSwitchMode: () => void }) {
    const chat = useMyServerChat(onSwitchMode);

    if (!chat.isInitialized && !chat.myDeviceId) {
        return <WelcomeScreen variant="register" onStart={chat.startRegistration} onBack={onSwitchMode} />;
    }

    return <ChatWorkspace chat={chat} onSwitchMode={onSwitchMode} />;
}

function DemoChat({ onSwitchMode }: { onSwitchMode: () => void }) {
    const chat = useDemoChat(onSwitchMode);
    return <ChatWorkspace chat={chat} onSwitchMode={onSwitchMode} demo />;
}

function ColleagueChat({ username, onLogout }: { username: string; onLogout: () => void }) {
    const { t } = useLanguage();

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
            <div className="pointer-events-none absolute inset-0 grid-overlay opacity-30" />
            <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

            <div className="glass neon-border relative w-full max-w-md rounded-[2rem] p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow">
                    <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Чат сервера коллеги</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Вы вошли как <span className="font-medium text-foreground">{username}</span>
                </p>
                <p className="mt-4 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.03] px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    Этот экран подключён к API коллеги. Полноценный чат появится после интеграции Signal-протокола.
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onLogout}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm font-semibold text-foreground/90 transition hover:bg-foreground/10"
                    >
                        <LogOut className="h-4 w-4" />
                        {t("logout")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [authMode, setAuthMode] = useState<AuthMode | null>(() => {
        const saved = localStorage.getItem("authMode");
        return saved === "my" || saved === "colleague" || saved === "demo" ? saved : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));

    const selectMode = (mode: AuthMode) => {
        localStorage.setItem("authMode", mode);
        setAuthMode(mode);
    };

    const resetMode = () => {
        localStorage.removeItem("authMode");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setAuthMode(null);
        setToken(null);
        setUsername(null);
    };

    const handleColleagueLogin = (newToken: string, newUsername: string) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("username", newUsername);
        setToken(newToken);
        setUsername(newUsername);
    };

    let content: React.ReactNode;

    if (!authMode) {
        content = (
            <WelcomeScreen
                onStart={() => selectMode("my")}
                onDemo={() => selectMode("demo")}
                onColleague={() => selectMode("colleague")}
            />
        );
    } else if (authMode === "demo") {
        content = <DemoChat onSwitchMode={resetMode} />;
    } else if (authMode === "my") {
        content = <MyServerChat onSwitchMode={resetMode} />;
    } else if (!token || !username) {
        content = <Auth onLogin={handleColleagueLogin} onBack={resetMode} />;
    } else {
        content = <ColleagueChat username={username} onLogout={resetMode} />;
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="invisible-theme">
            <LanguageProvider>{content}</LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
