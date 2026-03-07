import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, BarChart3, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { saveCheckIn, getTodayKey, getHistory } from "@/lib/checkin-storage";
import WeeklyHistory from "@/components/WeeklyHistory";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Screen =
  | "history"
  | "start"
  | "how-many"
  | "urge-time"
  | "feel"
  | "reflection"
  | "yes-done"
  | "no-reinforce"
  | "no-close"
  | "final-done";

const slide = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "hi", name: "हिन्दी" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
  { code: "ru", name: "Русский" },
  { code: "it", name: "Italiano" },
];

const SmokeCheck = () => {
  const { t, i18n } = useTranslation();
  const hasAnyHistory = getHistory().length > 0;
  const [screen, setScreen] = useState<Screen>(hasAnyHistory ? "history" : "start");
  const [smoked, setSmoked] = useState("");
  const [count, setCount] = useState("");
  const [urge, setUrge] = useState("");
  const [feeling, setFeeling] = useState("");
  const [step, setStep] = useState("");

  const go = (next: Screen, delay = 350) => {
    setTimeout(() => setScreen(next), delay);
  };

  const saveAndFinish = (didSmoke: boolean) => {
    saveCheckIn({
      date: getTodayKey(),
      smoked: didSmoke,
      ...(didSmoke && {
        count,
        urgeTime: urge,
        feeling,
        reflection: step || undefined,
      }),
    });
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url.toString());
  };

  const countOptions = [
    { label: t("count_1"), value: "1" },
    { label: t("count_2_3"), value: "2–3" },
    { label: t("count_4_5"), value: "4–5" },
    { label: t("count_more_5"), value: "More than 5" },
  ];
  const urgeOptions = [
    { label: t("urge_morning"), value: "Morning" },
    { label: t("urge_afternoon"), value: "Afternoon" },
    { label: t("urge_evening"), value: "Evening" },
    { label: t("urge_late_night"), value: "Late night" },
  ];
  const feelOptions = [
    { label: t("feel_okay"), value: "Okay" },
    { label: t("feel_neutral"), value: "Neutral" },
    { label: t("feel_not_great"), value: "Not great" },
  ];

  return (
    <div className="sc-gradient min-h-screen flex items-center justify-center px-6 relative">
      <div className="absolute top-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sc-midnight text-sm font-medium hover:bg-white/30 transition-all">
            <Globe className="w-4 h-4" />
            <span>{languages.find((l) => l.code === i18n.language)?.name || "Language"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl overflow-hidden p-1 min-w-[140px]">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${i18n.language === lang.code ? "bg-sc-midnight text-white" : "text-sc-midnight hover:bg-sc-midnight/5"
                  }`}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">

          {/* WEEKLY HISTORY */}
          {screen === "history" && (
            <WeeklyHistory
              key="history"
              onClose={() => setScreen("start")}
            />
          )}

          {/* SCREEN 1 – Start */}
          {screen === "start" && (
            <motion.div key="start" {...slide} className="flex flex-col items-center text-center gap-8">
              <span className="text-4xl">🚬</span>
              <div>
                <h1 className="sc-heading text-[1.75rem] mb-2">{t("title")}</h1>
                <p className="sc-body text-sc-midnight/50 text-sm">{t("subtitle")}</p>
              </div>
              <p className="sc-body text-lg text-sc-midnight">{t("question")}</p>
              <div className="flex flex-col gap-3 w-full">
                {[
                  { label: t("yes"), value: "Yes" },
                  { label: t("no"), value: "No" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSmoked(opt.value);
                      go(opt.value === "No" ? "no-reinforce" : "how-many");
                    }}
                    className={`sc-pill w-full ${smoked === opt.value ? "sc-pill-midnight" : "sc-pill-outline"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {hasAnyHistory && (
                <button
                  onClick={() => setScreen("history")}
                  className="flex items-center gap-2 text-sm sc-body text-sc-midnight/40 hover:text-sc-midnight/60 transition-colors mt-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  {t("viewWeeklyHistory")}
                </button>
              )}
            </motion.div>
          )}

          {/* YES – How many */}
          {screen === "how-many" && (
            <motion.div key="how-many" {...slide} className="flex flex-col items-center text-center gap-8">
              <p className="sc-body text-lg text-sc-midnight">{t("howManyQuestion")}</p>
              <div className="flex flex-col gap-3 w-full">
                {countOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setCount(opt.value);
                      go("urge-time");
                    }}
                    className={`sc-pill w-full ${count === opt.value ? "sc-pill-coral" : "sc-pill-outline"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* YES – Urge time */}
          {screen === "urge-time" && (
            <motion.div key="urge-time" {...slide} className="flex flex-col items-center text-center gap-8">
              <p className="sc-body text-lg text-sc-midnight">{t("urgeQuestion")}</p>
              <div className="flex flex-col gap-3 w-full">
                {urgeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setUrge(opt.value);
                      go("feel");
                    }}
                    className={`sc-pill w-full ${urge === opt.value ? "sc-pill-sage" : "sc-pill-outline"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* YES – Feel */}
          {screen === "feel" && (
            <motion.div key="feel" {...slide} className="flex flex-col items-center text-center gap-8">
              <p className="sc-body text-lg text-sc-midnight">{t("feelQuestion")}</p>
              <div className="flex flex-col gap-3 w-full">
                {feelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFeeling(opt.value);
                      go("reflection");
                    }}
                    className={`sc-pill w-full ${feeling === opt.value ? "sc-pill-coral" : "sc-pill-outline"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* YES – Reflection */}
          {screen === "reflection" && (
            <motion.div key="reflection" {...slide} className="flex flex-col items-center text-center gap-6">
              <p className="sc-body text-lg text-sc-midnight">
                {t("reflectionQuestion")}
              </p>
              <input
                type="text"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                placeholder={t("reflectionPlaceholder")}
                className="sc-input"
                autoFocus
              />
              <button
                onClick={() => {
                  saveAndFinish(true);
                  setScreen("yes-done");
                }}
                className="sc-pill sc-pill-midnight sc-shadow mt-2"
              >
                {t("saveToday")}
              </button>
            </motion.div>
          )}

          {/* YES – Done */}
          {screen === "yes-done" && (
            <motion.div key="yes-done" {...fade} className="flex flex-col items-center text-center gap-5">
              <p className="sc-heading text-xl text-sc-midnight">
                {t("awarenessBegins")}
              </p>
              <p className="sc-body text-sm text-sc-midnight/60 max-w-[280px] leading-relaxed">
                {t("tomorrowOpportunity")}
              </p>
              <button
                onClick={() => setScreen("final-done")}
                className="sc-pill sc-pill-midnight sc-shadow mt-6"
              >
                {t("done")}
              </button>
            </motion.div>
          )}

          {/* NO – Reinforcement */}
          {screen === "no-reinforce" && (
            <motion.div key="no-reinforce" {...fade} className="flex flex-col items-center text-center gap-5">
              <h2 className="sc-heading text-2xl text-sc-midnight">
                {t("smokeFreeHeading")}
              </h2>
              <p className="sc-body text-sm text-sc-midnight/60">
                {t("smokeFreeSubheading")}
              </p>
              <button
                onClick={() => {
                  saveAndFinish(false);
                  go("no-close", 0);
                }}
                className="sc-pill sc-pill-midnight sc-shadow mt-6"
              >
                {t("continue")}
              </button>
            </motion.div>
          )}

          {/* NO – Close */}
          {screen === "no-close" && (
            <motion.div key="no-close" {...fade} className="flex flex-col items-center text-center gap-5">
              <p className="sc-heading text-xl text-sc-midnight">
                {t("strengtheningControl")}
              </p>
              <p className="sc-body text-sm text-sc-midnight/60 max-w-[280px] leading-relaxed">
                {t("keepShowingUp")}
              </p>
              <button
                onClick={() => setScreen("final-done")}
                className="sc-pill sc-pill-midnight sc-shadow mt-6"
              >
                {t("finishCheckIn")}
              </button>
            </motion.div>
          )}

          {/* FINAL DONE – Checkmark */}
          {screen === "final-done" && (
            <motion.div
              key="final-done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-sc-sage flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="sc-heading text-lg text-sc-midnight">{t("saved")}</p>

              <button
                onClick={() => setScreen("history")}
                className="flex items-center gap-2 text-sm sc-body text-sc-midnight/40 hover:text-sc-midnight/60 transition-colors mt-4"
              >
                <BarChart3 className="w-4 h-4" />
                {t("viewYourWeek")}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmokeCheck;
