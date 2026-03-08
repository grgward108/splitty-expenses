import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  type RefresherEventDetail,
} from "@ionic/react";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Heading,
  Input,
  Label,
  Skeleton,
  Text,
  Textarea,
} from "@repo/ui";
import { useState } from "react";

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
  const [editingTask, setEditingTask] = useState<TaskFormData | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("pending");

  const { data, isLoading, refetch } = useTasksList();
  const createTaskMutation = useTasksCreate();
  const updateTaskMutation = useTasksUpdate();
  const deleteTaskMutation = useTasksDelete();

  const responseData = data?.data;
  const tasks: Task[] = responseData && "items" in responseData ? responseData.items : [];

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refetch();
    event.detail.complete();
  };

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
    } catch (error) {
      console.error("タスクの作成に失敗しました:", error);
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
    } catch (error) {
      console.error("タスクの更新に失敗しました:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync({ id: taskId });
      refetch();
    } catch (error) {
      console.error("タスクの削除に失敗しました:", error);
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

  if (isLoading) {
    return (
      <IonPage>
        <IonContent fullscreen className="ion-padding">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4 border-none shadow-sm">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="space-y-6 pb-20">
          <div className="px-1">
            <Heading level={3}>マイタスク</Heading>
            <Text size="sm" color="muted">
              {tasks.length} 件のタスク
            </Text>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Text color="muted">タスクがまだありません</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task: Task) => (
                <Card
                  key={task.id}
                  variant="modern"
                  className="overflow-hidden p-4 group active:scale-[0.98] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Heading
                        level={5}
                        className="text-base group-hover:text-primary-600 transition-colors"
                      >
                        {task.title}
                      </Heading>
                      <Badge variant={statusColors[task.status as TaskStatus]}>
                        {statusLabels[task.status as TaskStatus]}
                      </Badge>
                    </div>

                    {task.description && (
                      <Text size="sm" color="muted" className="line-clamp-2">
                        {task.description}
                      </Text>
                    )}

                    {task.dueDate && (
                      <Text size="xs" color="muted" className="flex items-center gap-1">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <title>カレンダーアイコン</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        期限: {new Date(task.dueDate).toLocaleDateString("ja-JP")}
                      </Text>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(task)}
                        className="flex-1 rounded-xl"
                      >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-1 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
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
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <Button
          variant="gradient"
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-4 right-4 rounded-2xl shadow-2xl shadow-primary-500/30 z-10 p-0 flex items-center justify-center text-3xl font-bold"
          aria-label="タスクを追加"
        >
          +
        </Button>

        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          className="!w-[calc(100%-2rem)] !max-w-md !mx-4 !my-auto"
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
            <DialogClose onClick={() => setIsDialogOpen(false)} />
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">新しいタスク</DialogTitle>
              <DialogDescription>タスクを追加して作業を管理しましょう。</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold ml-1">
                  タイトル
                </Label>
                <Input
                  id="title"
                  placeholder="例: レポートを作成する"
                  value={newTaskTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewTaskTitle(e.target.value)
                  }
                  className="rounded-xl bg-secondary-50 border-none dark:bg-secondary-950 focus:ring-2 focus:ring-primary-500 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold ml-1">
                  説明（任意）
                </Label>
                <Textarea
                  id="description"
                  placeholder="タスクの詳細を入力..."
                  value={newTaskDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewTaskDescription(e.target.value)
                  }
                  className="rounded-xl bg-secondary-50 border-none dark:bg-secondary-950 focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold ml-1">
                  ステータス
                </Label>
                <div className="flex gap-2">
                  {(["pending", "in_progress", "completed"] as TaskStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={newTaskStatus === status ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setNewTaskStatus(status)}
                      className="flex-1 rounded-xl h-10"
                    >
                      {statusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button variant="gradient" onClick={handleAddTask}>
                タスク作成
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 編集ダイアログ */}
        <Dialog
          open={editingTask !== null}
          onOpenChange={(open) => !open && setEditingTask(null)}
          className="!w-[calc(100%-2rem)] !max-w-md !mx-4 !my-auto"
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
            <DialogClose onClick={() => setEditingTask(null)} />
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">タスクを編集</DialogTitle>
              <DialogDescription>タスクの内容を変更します。</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-semibold ml-1">
                  タイトル
                </Label>
                <Input
                  id="edit-title"
                  placeholder="例: レポートを作成する"
                  value={editingTask?.title || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  className="rounded-xl bg-secondary-50 border-none dark:bg-secondary-950 focus:ring-2 focus:ring-primary-500 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-semibold ml-1">
                  説明（任意）
                </Label>
                <Textarea
                  id="edit-description"
                  placeholder="タスクの詳細を入力..."
                  value={editingTask?.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditingTask((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  className="rounded-xl bg-secondary-50 border-none dark:bg-secondary-950 focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-semibold ml-1">
                  ステータス
                </Label>
                <div className="flex gap-2">
                  {(["pending", "in_progress", "completed"] as TaskStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={editingTask?.status === status ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setEditingTask((prev) => (prev ? { ...prev, status } : null))}
                      className="flex-1 rounded-xl h-10"
                    >
                      {statusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                キャンセル
              </Button>
              <Button variant="gradient" onClick={handleEditTask}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </IonContent>
    </IonPage>
  );
}

export default TasksPage;
