import { useTranslation } from "@repo/i18n";
import { useGroupsCreate } from "@repo/spec/client/groups/groups";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const CURRENCIES = [
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "\u20ac EUR" },
  { code: "GBP", label: "\u00a3 GBP" },
  { code: "JPY", label: "\u00a5 JPY" },
  { code: "AUD", label: "A$ AUD" },
  { code: "SGD", label: "S$ SGD" },
  { code: "THB", label: "\u0e3f THB" },
  { code: "IDR", label: "Rp IDR" },
];

const EMOJIS = [
  "\ud83d\ude00", "\ud83d\ude0e", "\ud83e\udd29", "\ud83e\udd73", "\ud83d\ude0d",
  "\ud83e\udd17", "\ud83d\ude1c", "\ud83e\udd2f", "\ud83d\udc7b", "\ud83d\udc36",
  "\ud83d\udc31", "\ud83e\udd81", "\ud83d\udc3b", "\ud83d\udc28", "\ud83e\udd8a",
  "\ud83d\udc35", "\ud83d\udc37", "\ud83d\udc25", "\ud83e\udd85", "\ud83e\udd84",
];

const COLOR_ROTATION = ["var(--cyan)", "var(--pink)", "var(--lime)", "var(--lavender)", "var(--yellow)", "var(--red)"];

interface MemberInput { name: string; emoji: string; }
interface RecentGroup { id: string; name: string; }

function getRecentGroups(): RecentGroup[] {
  try { return JSON.parse(localStorage.getItem("splitty_recent_groups") ?? "[]"); } catch { return []; }
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

  const updateMember = useCallback((index: number, field: keyof MemberInput, value: string) => {
    setMembers((prev) => prev.map((m: MemberInput, i: number) => (i === index ? { ...m, [field]: value } : m)));
  }, []);

  const validMembers = members.filter((m: MemberInput) => m.name.trim());
  const canSubmit = groupName.trim() && validMembers.length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createGroup.mutate(
      { data: { name: groupName.trim(), currency, members: validMembers.map((m: MemberInput) => ({ name: m.name.trim(), emoji: m.emoji })) } },
      {
        onSuccess: (response: { data: { id: string; name: string } }) => {
          saveRecentGroup({ id: response.data.id, name: response.data.name });
          navigate({ to: "/group/$groupId", params: { groupId: response.data.id } });
        },
      }
    );
  };

  return (
    <div className="animate-in">
      {/* HERO */}
      <div className="mb-8 pt-2">
        <div className="inline-block mb-3 px-3 py-1" style={{ background: "var(--cyan)", border: "2px solid var(--black)", transform: "rotate(-1deg)" }}>
          <span className="font-display text-xs">SPLIT BILLS, NOT FRIENDSHIPS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl leading-none">
          {t("title")}
        </h1>
      </div>

      {/* FORM */}
      <div className="brutal-card p-5 sm:p-7 animate-pop">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="font-display text-xs block mb-2">{t("groupName")}</label>
            <input
              className="input-brutal"
              placeholder={t("groupNamePlaceholder")}
              value={groupName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
            />
          </div>

          {/* Currency */}
          <div>
            <label className="font-display text-xs block mb-2">{t("currency")}</label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className="px-3 py-1.5 text-xs font-bold transition-all"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    background: currency === c.code ? "var(--black)" : "var(--white)",
                    color: currency === c.code ? "var(--white)" : "var(--black)",
                    border: "2px solid var(--black)",
                    boxShadow: currency === c.code ? "none" : "2px 2px 0 var(--black)",
                    transform: currency === c.code ? "translate(2px, 2px)" : "none",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="font-display text-xs block mb-3">{t("members")}</label>
            <div className="space-y-3">
              {members.map((member: MemberInput, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Emoji button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEmojiPickerIndex(emojiPickerIndex === index ? null : index)}
                      className="w-12 h-12 flex items-center justify-center text-xl transition-all"
                      style={{
                        border: "var(--border)",
                        boxShadow: "var(--shadow-sm)",
                        background: COLOR_ROTATION[index % COLOR_ROTATION.length],
                      }}
                    >
                      {member.emoji}
                    </button>
                    {/* Emoji Picker */}
                    {emojiPickerIndex === index && (
                      <div
                        className="absolute left-0 top-14 z-50 p-3 animate-pop"
                        style={{
                          width: "220px",
                          background: "var(--white)",
                          border: "var(--border)",
                          boxShadow: "var(--shadow)",
                        }}
                      >
                        <div className="grid grid-cols-5 gap-1">
                          {EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => { updateMember(index, "emoji", emoji); setEmojiPickerIndex(null); }}
                              className="w-9 h-9 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                              style={{ border: "1px solid transparent" }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    className="input-brutal flex-1"
                    placeholder={`${t("memberName")} ${index + 1}`}
                    value={member.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMember(index, "name", e.target.value)}
                  />
                  {members.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="w-12 h-12 flex items-center justify-center text-lg font-bold transition-all"
                      style={{
                        border: "2px solid var(--black)",
                        color: "var(--red)",
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMember}
              className="w-full mt-3 py-3 text-sm font-bold transition-all"
              style={{
                fontFamily: "'Space Mono', monospace",
                border: "3px dashed var(--black)",
                background: "transparent",
              }}
            >
              + {t("addMember")}
            </button>

            {members.length >= 2 && validMembers.length < 2 && (
              <div className="mt-2 px-3 py-2 text-xs font-bold text-center" style={{ background: "var(--red)", color: "var(--white)", border: "2px solid var(--black)" }}>
                {t("needAtLeastTwo")}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || createGroup.isPending}
            className="btn-brutal w-full text-center"
          >
            {createGroup.isPending ? tc("saving") : t("createGroup")}
          </button>
        </form>
      </div>

      {/* Recent Groups */}
      {recentGroups.length > 0 && (
        <div className="mt-10">
          <div className="inline-block mb-4 px-3 py-1" style={{ background: "var(--lavender)", border: "2px solid var(--black)", transform: "rotate(1deg)" }}>
            <span className="font-display text-xs">{t("recentGroups")}</span>
          </div>
          <div className="space-y-3 stagger">
            {recentGroups.map((group: RecentGroup, i: number) => (
              <button
                key={group.id}
                onClick={() => navigate({ to: "/group/$groupId", params: { groupId: group.id } })}
                className="w-full text-left p-4 flex items-center gap-3 brutal-card"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center font-display text-sm"
                  style={{ background: COLOR_ROTATION[i % COLOR_ROTATION.length], border: "2px solid var(--black)" }}
                >
                  {group.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-bold flex-1">{group.name}</span>
                <span className="font-display text-lg">{"\u2192"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
