import { useTranslation } from "@repo/i18n";
import { useGroupsCreate } from "@repo/spec/client/groups/groups";
import { Button, Card, CardContent, CardHeader, Input, Label } from "@repo/ui";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "\u20ac", label: "EUR (\u20ac)" },
  { code: "GBP", symbol: "\u00a3", label: "GBP (\u00a3)" },
  { code: "JPY", symbol: "\u00a5", label: "JPY (\u00a5)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
  { code: "CAD", symbol: "C$", label: "CAD (C$)" },
  { code: "SGD", symbol: "S$", label: "SGD (S$)" },
  { code: "THB", symbol: "\u0e3f", label: "THB (\u0e3f)" },
  { code: "IDR", symbol: "Rp", label: "IDR (Rp)" },
];

const COMMON_EMOJIS = [
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
    const groups = getRecentGroups().filter((g) => g.id !== group.id);
    groups.unshift(group);
    localStorage.setItem(
      "splitty_recent_groups",
      JSON.stringify(groups.slice(0, 10))
    );
  } catch {
    // ignore
  }
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
    const nextEmoji =
      COMMON_EMOJIS[members.length % COMMON_EMOJIS.length] ?? "\ud83d\ude00";
    setMembers((prev) => [...prev, { name: "", emoji: nextEmoji }]);
  }, [members.length]);

  const removeMember = useCallback((index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateMember = useCallback(
    (index: number, field: keyof MemberInput, value: string) => {
      setMembers((prev) =>
        prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
      );
    },
    []
  );

  const validMembers = members.filter((m) => m.name.trim());
  const canSubmit = groupName.trim() && validMembers.length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    createGroup.mutate(
      {
        data: {
          name: groupName.trim(),
          currency,
          members: validMembers.map((m) => ({
            name: m.name.trim(),
            emoji: m.emoji,
          })),
        },
      },
      {
        onSuccess: (response) => {
          const group = response.data as { id: string; name: string };
          saveRecentGroup({ id: group.id, name: group.name });
          navigate({ to: "/group/$groupId", params: { groupId: group.id } });
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="text-center">
            <span className="text-4xl mb-2 block">\ud83d\udc65</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              {t("title")}
            </h1>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="groupName">{t("groupName")}</Label>
              <Input
                id="groupName"
                placeholder={t("groupNamePlaceholder")}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">{t("currency")}</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Members */}
            <div className="space-y-3">
              <Label>{t("members")}</Label>
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setEmojiPickerIndex(
                            emojiPickerIndex === index ? null : index
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-white text-xl hover:bg-gray-50 transition-colors"
                      >
                        {member.emoji}
                      </button>
                      {emojiPickerIndex === index && (
                        <div className="absolute left-0 top-12 z-50 grid grid-cols-5 gap-1 rounded-xl border bg-white p-2 shadow-lg">
                          {COMMON_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                updateMember(index, "emoji", emoji);
                                setEmojiPickerIndex(null);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-purple-100 transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input
                      placeholder={t("memberName")}
                      value={member.name}
                      onChange={(e) =>
                        updateMember(index, "name", e.target.value)
                      }
                      className="flex-1 bg-white"
                    />
                    {members.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        \u2715
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addMember}
                className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                + {t("addMember")}
              </Button>

              {members.length >= 2 && validMembers.length < 2 && (
                <p className="text-sm text-orange-500 text-center">
                  {t("needAtLeastTwo")}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit || createGroup.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-50"
            >
              {createGroup.isPending ? tc("saving") : t("createGroup")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Groups */}
      {recentGroups.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            {t("recentGroups")}
          </h2>
          <div className="space-y-2">
            {recentGroups.map((group) => (
              <button
                key={group.id}
                onClick={() =>
                  navigate({
                    to: "/group/$groupId",
                    params: { groupId: group.id },
                  })
                }
                className="w-full text-left p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md hover:bg-white transition-all flex items-center gap-3"
              >
                <span className="text-2xl">\ud83d\udcc1</span>
                <span className="font-medium text-gray-800">{group.name}</span>
                <span className="ml-auto text-gray-400">\u2192</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
