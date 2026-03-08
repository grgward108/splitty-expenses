import {
  useTasksCreate,
  useTasksDelete,
  useTasksList,
  useTasksUpdate,
} from "@repo/spec/client/tasks/tasks";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
  Textarea,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: TasksPage,
});

type TaskStatus = "pending" | "in_progress" | "completed";

const statusLabels: Record<TaskStatus, string> = {
  pending: "未着手",
  in_progress: "進行中",
  completed: "完了",
};

const statusColors: Record<TaskStatus, "default" | "warning" | "success"> = {
  pending: "default",
  in_progress: "warning",
  completed: "success",
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: string | null;
};

type TaskFormData = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
};

function TasksPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskFormData | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("pending");

  const { data, isLoading, error, refetch } = useTasksList();
  const createTaskMutation = useTasksCreate();
  const updateTaskMutation = useTasksUpdate();
  const deleteTaskMutation = useTasksDelete();

  const handleAddTask = async () => {
    if (!newTaskTitle) return;

    try {
      await createTaskMutation.mutateAsync({
        data: {
          title: newTaskTitle,
          description: newTaskDescription || undefined,
          status: newTaskStatus,
        },
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("pending");
      setIsDialogOpen(false);
      refetch();
    } catch (err) {
      console.error("タスクの作成に失敗しました:", err);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.title) return;

    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        data: {
          title: editingTask.title,
          description: editingTask.description || undefined,
          status: editingTask.status,
        },
      });
      setEditingTask(null);
      refetch();
    } catch (err) {
      console.error("タスクの更新に失敗しました:", err);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;

    try {
      await deleteTaskMutation.mutateAsync({ id: deletingTaskId });
      setDeletingTaskId(null);
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (err) {
      console.error("タスクの削除に失敗しました:", err);
    }
  };

  const openEditDialog = (task: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
  }) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status as TaskStatus,
    });
  };

  const openDeleteDialog = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-red-600 dark:text-red-400">タスクの読み込みに失敗しました</p>
        <Button variant="outline" onClick={() => refetch()}>
          再試行
        </Button>
      </div>
    );
  }

  const responseData = data?.data;
  const tasks: Task[] = responseData && "items" in responseData ? responseData.items : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">タスク</h1>
        <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
          タスク追加
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
          タスクが見つかりません
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <Badge variant={statusColors[task.status as TaskStatus]}>
                    {statusLabels[task.status as TaskStatus]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {task.description && (
                  <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                    {task.description}
                  </p>
                )}
                {task.dueDate && (
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
                    期限: {new Date(task.dueDate).toLocaleDateString("ja-JP")}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(task)}>
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>編集</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    編集
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(task.id)}>
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>削除</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>新しいタスク</DialogTitle>
            <DialogDescription>タスクを追加して作業を管理しましょう。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                placeholder="例: レポートを作成する"
                value={newTaskTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTaskTitle(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Textarea
                id="description"
                placeholder="タスクの詳細を入力..."
                value={newTaskDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewTaskDescription(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <div className="flex gap-2">
                {(["pending", "in_progress", "completed"] as TaskStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={newTaskStatus === status ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setNewTaskStatus(status)}
                    className="flex-1"
                  >
                    {statusLabels[status]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleAddTask}>
              タスク作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={editingTask !== null} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogClose onClick={() => setEditingTask(null)} />
          <DialogHeader>
            <DialogTitle>タスクを編集</DialogTitle>
            <DialogDescription>タスクの内容を変更します。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">タイトル</Label>
              <Input
                id="edit-title"
                placeholder="例: レポートを作成する"
                value={editingTask?.title || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">説明（任意）</Label>
              <Textarea
                id="edit-description"
                placeholder="タスクの詳細を入力..."
                value={editingTask?.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">ステータス</Label>
              <div className="flex gap-2">
                {(["pending", "in_progress", "completed"] as TaskStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={editingTask?.status === status ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setEditingTask((prev) => (prev ? { ...prev, status } : null))}
                    className="flex-1"
                  >
                    {statusLabels[status]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleEditTask}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogClose
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setDeletingTaskId(null);
            }}
          />
          <DialogHeader>
            <DialogTitle>タスクを削除</DialogTitle>
            <DialogDescription>
              このタスクを削除してもよろしいですか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingTaskId(null);
              }}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
