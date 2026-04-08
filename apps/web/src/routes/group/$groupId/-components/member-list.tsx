import { useTranslation } from "@repo/i18n";
import {
  useMembersAdd,
  useMembersUpdate,
  useMembersRemove,
} from "@repo/spec/client/members/members";
import { getGroupsGetQueryKey } from "@repo/spec/client/groups/groups";
import { getBalancesGetQueryKey } from "@repo/spec/client/balances/balances";
import type { Group, Member } from "@repo/spec/client/model";
import { Button, Card, CardContent, Input } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const COMMON_EMOJIS = [
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
    queryClient.invalidateQueries({
      queryKey: getGroupsGetQueryKey(groupId),
    });
    queryClient.invalidateQueries({
      queryKey: getBalancesGetQueryKey(groupId),
    });
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMember.mutate(
      {
        groupId,
        data: { name: newName.trim(), emoji: newEmoji },
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewEmoji("\ud83d\ude00");
          invalidate();
        },
      }
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
      {
        groupId,
        memberId: editingId,
        data: { name: editName.trim(), emoji: editEmoji },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          invalidate();
        },
      }
    );
  };

  const handleRemove = (memberId: string) => {
    if (deletingId === memberId) {
      removeMember.mutate(
        { groupId, memberId },
        {
          onSuccess: () => {
            setDeletingId(null);
            invalidate();
          },
        }
      );
    } else {
      setDeletingId(memberId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Member cards */}
      <div className="space-y-2">
        {group.members.map((member) => {
          const isEditing = editingId === member.id;

          if (isEditing) {
            return (
              <Card
                key={member.id}
                className="border-2 border-purple-300 shadow-sm bg-white/90"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setEmojiPickerFor(
                            emojiPickerFor === member.id ? null : member.id
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-white text-xl hover:bg-gray-50"
                      >
                        {editEmoji}
                      </button>
                      {emojiPickerFor === member.id && (
                        <div className="absolute left-0 top-12 z-50 grid grid-cols-5 gap-1 rounded-xl border bg-white p-2 shadow-lg">
                          {COMMON_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setEditEmoji(emoji);
                                setEmojiPickerFor(null);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-purple-100"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={updateMember.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      {tc("save")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      {tc("cancel")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={member.id}
              className="border-0 shadow-sm bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{member.emoji}</span>
                <span className="font-medium text-gray-900 flex-1">
                  {member.name}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(member)}
                    className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    {tc("edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(member.id)}
                    className={`text-xs ${
                      deletingId === member.id
                        ? "border-red-400 bg-red-50 text-red-600"
                        : "border-red-200 text-red-400 hover:bg-red-50"
                    }`}
                  >
                    {deletingId === member.id ? tc("confirm") : tc("delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add member form */}
      <Card className="border-2 border-dashed border-purple-200 bg-white/60">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {t("addMember")}
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setEmojiPickerFor(emojiPickerFor === "new" ? null : "new")
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-white text-xl hover:bg-gray-50"
              >
                {newEmoji}
              </button>
              {emojiPickerFor === "new" && (
                <div className="absolute left-0 top-12 z-50 grid grid-cols-5 gap-1 rounded-xl border bg-white p-2 shadow-lg">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewEmoji(emoji);
                        setEmojiPickerFor(null);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-purple-100"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input
              placeholder={t("memberName")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || addMember.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              {tc("add")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
