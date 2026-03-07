import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckInEntry, getWeekDates, getWeekHistory } from "@/lib/checkin-storage";
import { Check, X, Minus } from "lucide-react";

interface WeeklyHistoryProps {
  onClose: () => void;
}

const WeeklyHistory = ({ onClose }: WeeklyHistoryProps) => {
  const { t } = useTranslation();
  const dates = getWeekDates();
  const history = getWeekHistory();

  const smokeFreeCount = history.filter((e) => e !== null && !e.smoked).length;
  const smokedCount = history.filter((e) => e !== null && e.smoked).length;

  const getIcon = (entry: CheckInEntry | null) => {
    if (!entry) return <Minus className="w-4 h-4 text-sc-midnight/25" />;
    if (entry.smoked) return <X className="w-4 h-4 text-white" />;
    return <Check className="w-4 h-4 text-white" />;
  };

  const getBg = (entry: CheckInEntry | null) => {
    if (!entry) return "bg-sc-midnight/5";
    if (entry.smoked) return "bg-sc-coral";
    return "bg-sc-sage";
  };

  const getDetail = (entry: CheckInEntry | null) => {
    if (!entry) return "—";
    if (!entry.smoked) return t("smokeFreeCheck");
    return entry.count ? `${entry.count} ${t("cigs")}` : t("smokedLabel");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.div
      key="weekly"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center text-center gap-6"
    >
      <div>
        <h2 className="sc-heading text-xl text-sc-midnight mb-1">{t("yourWeekTitle")}</h2>
        <p className="sc-body text-sm text-sc-midnight/50">{t("weekGlance")}</p>
      </div>

      {/* Week grid */}
      <div className="w-full flex justify-between gap-1 px-1">
        {dates.map((day, i) => {
          const entry = history[i];
          const isToday = day.key === today;

          return (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <span
                className={`sc-body text-[11px] font-medium ${isToday ? "text-sc-midnight" : "text-sc-midnight/40"
                  }`}
              >
                {day.dayName}
              </span>

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${getBg(
                  entry
                )} ${isToday ? "ring-2 ring-sc-midnight/20 ring-offset-2" : ""}`}
              >
                {getIcon(entry)}
              </div>

              <span className="sc-body text-[10px] text-sc-midnight/50">{day.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className="w-full flex gap-3 mt-2"
      >
        <div className="flex-1 bg-sc-sage/15 rounded-2xl py-4 px-3">
          <p className="sc-heading text-2xl text-sc-midnight">{smokeFreeCount}</p>
          <p className="sc-body text-xs text-sc-midnight/50 mt-0.5">{t("smokeFreeLabel")}</p>
        </div>
        <div className="flex-1 bg-sc-coral/15 rounded-2xl py-4 px-3">
          <p className="sc-heading text-2xl text-sc-midnight">{smokedCount}</p>
          <p className="sc-body text-xs text-sc-midnight/50 mt-0.5">{t("smokedLabel")}</p>
        </div>
        <div className="flex-1 bg-sc-midnight/5 rounded-2xl py-4 px-3">
          <p className="sc-heading text-2xl text-sc-midnight">{7 - smokeFreeCount - smokedCount}</p>
          <p className="sc-body text-xs text-sc-midnight/50 mt-0.5">{t("noDataLabel")}</p>
        </div>
      </motion.div>

      {/* Motivation */}
      {smokeFreeCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="sc-body text-sm text-sc-midnight/60 max-w-[280px] leading-relaxed"
        >
          {smokeFreeCount >= 5
            ? t("incredibleConsistency")
            : smokeFreeCount >= 3
              ? t("halfWeekSmokeFree")
              : t("everyDayCounts")}
        </motion.p>
      )}

      <button
        onClick={onClose}
        className="sc-pill sc-pill-midnight sc-shadow mt-2"
      >
        {t("startTodayCheckIn")}
      </button>
    </motion.div>
  );
};

export default WeeklyHistory;
