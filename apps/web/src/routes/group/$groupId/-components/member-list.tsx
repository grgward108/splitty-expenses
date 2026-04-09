import { useTranslation } from "@repo/i18n";
import {
  useMembersAdd,
  useMembersUpdate,
  useMembersRemove,
} from "@repo/spec/client/members/members";
import { getGroupsGetQueryKey } from "@repo/spec/client/groups/groups";
import { getBalancesGetQueryKey } from "@repo/spec/client/balances/balances";
import type { Group, Member } from "@repo/spec/client/model";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const EMOJIS = [
  "\ud83d\ude00", "\ud83d\ude0e", "\ud83e\udd29", "\ud83e\udd73", "\ud83d\ude0d",
  "\ud83e\udd17", "\ud83d\ude1c", "\ud83e\udd2f", "\ud83d\udc7b", "\ud83d\udc36",
  "\ud83d\udc31", "\ud83e\udd81", "\ud83d\udc3b", "\ud83d\udc28", "\ud83e\udd8a",
  "\ud83d\udc35", "\ud83d\udc37", "\ud83d\udc25", "\ud83e\udd85", "\ud83e\udd84",
];

interface MemberListProps {
  groupId: string;
  group: Group;
}

export function MemberList({ groupId, group }: MemberListProps) {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("common");
  const queryClient = useQueryClient();
  const addMember = useMembersAdd();
  const updateMember = useMembersUpdate();
  const removeMember = useMembersRemove();

  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("\ud83d\ude00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGroupsGetQueryKey(groupId) });
    queryClient.invalidateQueries({ queryKey: getBalancesGetQueryKey(groupId) });
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMember.mutate(
      { groupId, data: { name: newName.trim(), emoji: newEmoji } },
      { onSuccess: () => { setNewName(""); setNewEmoji("\ud83d\ude00"); invalidate(); } }
    );
  };

  const startEdit = (member: Member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditEmoji(member.emoji);
  };

  const handleUpdate = () => {
    if (!editingId || !editName.trim()) return;
    updateMember.mutate(
      { groupId, memberId: editingId, data: { name: editName.trim(), emoji: editEmoji } },
      { onSuccess: () => { setEditingId(null); invalidate(); } }
    );
  };

  const handleRemove = (memberId: string) => {
    if (deletingId === memberId) {
      removeMember.mutate(
        { groupId, memberId },
        { onSuccess: () => { setDeletingId(null); invalidate(); } }
      );
    } else {
      setDeletingId(memberId);
    }
  };

  const EmojiPicker = ({ pickerId, onSelect }: { pickerId: string; onSelect: (emoji: string) => void }) => {
    if (emojiPickerFor !== pickerId) return null;
    return (
      <div
        className="absolute left-0 top-13 z-50 grid grid-cols-5 gap-1 p-2.5 rounded-xl shadow-xl"
        style={{ background: "var(--color-warm-white)", border: "1px solid var(--color-border)" }}
      >
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => { onSelect(emoji); setEmojiPickerFor(null); }}
            className="w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Member cards */}
      <div className="card-surface overflow-hidden">
        {group.members.map((member: Member, i: number) => {
          const isEditing = editingId === member.id;

          if (isEditing) {
            return (
              <div
                key={member.id}
                className="p-4"
                style={{
                  borderBottom: i < group.members.length - 1 ? "1px solid var(--color-border)" : "none",
                  background: "rgba(0,0,0,0.02)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEmojiPickerFor(emojiPickerFor === member.id ? null : member.id)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all"
                      style={{ background: "var(--color-cream)", border: "1.5px solid var(--color-border)" }}
                    >
                      {editEmoji}
                    </button>
                    <EmojiPicker pickerId={member.id} onSelect={setEditEmoji} />
                  </div>
                  <input
                    className="input-field flex-1"
                    value={editName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleUpdate()}
                  />
                  <button onClick={handleUpdate} disabled={updateMember.isPending} className="btn-primary text-sm py-2 px-4">
                    {tc("save")}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-secondary text-sm py-2 px-4">
                    {tc("cancel")}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 p-4 hover:bg-black/[0.01] transition-colors"
              style={{ borderBottom: i < group.members.length - 1 ? "1px solid var(--color-border)" : "none" }}
            >
              <span className="text-2xl">{member.emoji}</span>
              <span className="font-medium flex-1" style={{ color: "var(--color-charcoal)" }}>
                {member.name}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(member)}
                  className="text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                  style={{ color: "var(--color-slate)", background: "rgba(0,0,0,0.04)" }}
                >
                  {tc("edit")}
                </button>
                <button
                  onClick={() => handleRemove(member.id)}
                  className="text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                  style={{
                    color: deletingId === member.id ? "white" : "var(--color-coral)",
                    background: deletingId === member.id ? "var(--color-coral)" : "rgba(239,100,97,0.08)",
                  }}
                >
                  {deletingId === member.id ? tc("confirm") : tc("delete")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add member */}
      <div
        className="p-4 rounded-xl"
        style={{ border: "1.5px dashed var(--color-border)" }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-charcoal)" }}>
          {t("addMember")}
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setEmojiPickerFor(emojiPickerFor === "new" ? null : "new")}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all"
              style={{ background: "var(--color-cream)", border: "1.5px solid var(--color-border)" }}
            >
              {newEmoji}
            </button>
            <EmojiPicker pickerId="new" onSelect={setNewEmoji} />
          </div>
          <input
            className="input-field flex-1"
            placeholder={t("memberName")}
            value={newName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || addMember.isPending}
            className="btn-primary text-sm py-2 px-4"
          >
            {tc("add")}
          </button>
        </div>
      </div>
    </div>
  );
}
