import { useTranslation } from "@repo/i18n";
import { useGroupsCreate } from "@repo/spec/client/groups/groups";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "$ USD" },
  { code: "EUR", symbol: "\u20ac", label: "\u20ac EUR" },
  { code: "GBP", symbol: "\u00a3", label: "\u00a3 GBP" },
  { code: "JPY", symbol: "\u00a5", label: "\u00a5 JPY" },
  { code: "AUD", symbol: "A$", label: "A$ AUD" },
  { code: "CAD", symbol: "C$", label: "C$ CAD" },
  { code: "SGD", symbol: "S$", label: "S$ SGD" },
  { code: "THB", symbol: "\u0e3f", label: "\u0e3f THB" },
  { code: "IDR", symbol: "Rp", label: "Rp IDR" },
];

const EMOJIS = [
  "\ud83d\ude00", "\ud83d\ude0e", "\ud83e\udd29", "\ud83e\udd73", "\ud83d\ude0d",
  "\ud83e\udd17", "\ud83d\ude1c", "\ud83e\udd2f", "\ud83d\udc7b", "\ud83d\udc36",
  "\ud83d\udc31", "\ud83e\udd81", "\ud83d\udc3b", "\ud83d\udc28", "\ud83e\udd8a",
  "\ud83d\udc35", "\ud83d\udc37", "\ud83d\udc25", "\ud83e\udd85", "\ud83e\udd84",
];

interface MemberInput {
  name: string;
  emoji: string;
}

interface RecentGroup {
  id: string;
  name: string;
}

function getRecentGroups(): RecentGroup[] {
  try {
    const stored = localStorage.getItem("splitty_recent_groups");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentGroup(group: RecentGroup) {
  try {
    const groups = getRecentGroups().filter((g: RecentGroup) => g.id !== group.id);
    groups.unshift(group);
    localStorage.setItem("splitty_recent_groups", JSON.stringify(groups.slice(0, 10)));
  } catch {}
}

function HomePage() {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("common");
  const navigate = useNavigate();
  const createGroup = useGroupsCreate();

  const [groupName, setGroupName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [members, setMembers] = useState<MemberInput[]>([
    { name: "", emoji: "\ud83d\ude00" },
    { name: "", emoji: "\ud83d\ude0e" },
  ]);
  const [emojiPickerIndex, setEmojiPickerIndex] = useState<number | null>(null);
  const [recentGroups] = useState<RecentGroup[]>(getRecentGroups);

  const addMember = useCallback(() => {
    const nextEmoji = EMOJIS[members.length % EMOJIS.length] ?? "\ud83d\ude00";
    setMembers((prev) => [...prev, { name: "", emoji: nextEmoji }]);
  }, [members.length]);

  const removeMember = useCallback((index: number) => {
    setMembers((prev) => prev.filter((_: MemberInput, i: number) => i !== index));
  }, []);

  const updateMember = useCallback(
    (index: number, field: keyof MemberInput, value: string) => {
      setMembers((prev) =>
        prev.map((m: MemberInput, i: number) => (i === index ? { ...m, [field]: value } : m))
      );
    },
    []
  );

  const validMembers = members.filter((m: MemberInput) => m.name.trim());
  const canSubmit = groupName.trim() && validMembers.length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    createGroup.mutate(
      {
        data: {
          name: groupName.trim(),
          currency,
          members: validMembers.map((m: MemberInput) => ({ name: m.name.trim(), emoji: m.emoji })),
        },
      },
      {
        onSuccess: (response: { data: { id: string; name: string } }) => {
          const group = response.data;
          saveRecentGroup({ id: group.id, name: group.name });
          navigate({ to: "/group/$groupId", params: { groupId: group.id } });
        },
      }
    );
  };

  return (
    <div className="animate-slide-up">
      {/* Hero */}
      <div className="text-center mb-8 pt-4">
        <h1 className="font-display text-4xl sm:text-5xl italic tracking-tight mb-2" style={{ color: "var(--color-charcoal)" }}>
          {t("title")}
        </h1>
        <p style={{ color: "var(--color-muted)" }} className="text-base">
          Split expenses, not friendships
        </p>
      </div>

      {/* Form Card */}
      <div className="card-surface p-6 sm:p-8 bg-noise">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-charcoal)" }}>
              {t("groupName")}
            </label>
            <input
              className="input-field"
              placeholder={t("groupNamePlaceholder")}
              value={groupName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-charcoal)" }}>
              {t("currency")}
            </label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: currency === c.code ? "var(--color-charcoal)" : "transparent",
                    color: currency === c.code ? "white" : "var(--color-slate)",
                    border: currency === c.code ? "1.5px solid var(--color-charcoal)" : "1.5px solid var(--color-border)",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-charcoal)" }}>
              {t("members")}
            </label>
            <div className="space-y-2.5">
              {members.map((member: MemberInput, index: number) => (
                <div key={index} className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Emoji picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEmojiPickerIndex(emojiPickerIndex === index ? null : index)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-105"
                      style={{
                        background: "var(--color-cream)",
                        border: "1.5px solid var(--color-border)",
                      }}
                    >
                      {member.emoji}
                    </button>
                    {emojiPickerIndex === index && (
                      <div
                        className="absolute left-0 top-13 z-50 grid grid-cols-5 gap-1 p-2.5 rounded-xl shadow-xl"
                        style={{
                          background: "var(--color-warm-white)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              updateMember(index, "emoji", emoji);
                              setEmojiPickerIndex(null);
                            }}
                            className="w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-black/5 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    className="input-field flex-1"
                    placeholder={`${t("memberName")} ${index + 1}`}
                    value={member.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMember(index, "name", e.target.value)}
                  />
                  {members.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:bg-red-50"
                      style={{ color: "var(--color-coral)", border: "1.5px solid transparent" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMember}
              className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                border: "1.5px dashed var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              + {t("addMember")}
            </button>

            {members.length >= 2 && validMembers.length < 2 && (
              <p className="text-sm mt-2 text-center" style={{ color: "var(--color-amber)" }}>
                {t("needAtLeastTwo")}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || createGroup.isPending}
            className="btn-primary w-full text-center"
          >
            {createGroup.isPending ? tc("saving") : t("createGroup")}
          </button>
        </form>
      </div>

      {/* Recent Groups */}
      {recentGroups.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl italic mb-4" style={{ color: "var(--color-charcoal)" }}>
            {t("recentGroups")}
          </h2>
          <div className="space-y-2 stagger-children">
            {recentGroups.map((group: RecentGroup) => (
              <button
                key={group.id}
                onClick={() => navigate({ to: "/group/$groupId", params: { groupId: group.id } })}
                className="w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 group"
                style={{
                  background: "var(--color-warm-white)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: "var(--color-cream)" }}
                >
                  {group.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="font-medium flex-1">{group.name}</span>
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: "var(--color-muted)" }}
                  className="transition-transform group-hover:translate-x-1"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
