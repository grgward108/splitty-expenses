import { getLocaleForDate, useTranslation } from "@repo/i18n";
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
  PageLoader,
  Textarea,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Task, TaskFormData, TaskStatus } from "./route.model";
import { statusColors } from "./route.model";

export const Route = createFileRoute("/_auth/")({
  component: TasksPage,
});

function TasksPage() {
  const { t } = useTranslation("tasks");
  const { t: tCommon } = useTranslation("common");
  const { i18n } = useTranslation();
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
    return <PageLoader message={t("loadLoading")} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-red-600 dark:text-red-400">{t("loadFailed")}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const responseData = data?.data;
  const tasks: Task[] = responseData && "items" in responseData ? responseData.items : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
          {t("pageTitle")}
        </h1>
        <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
          {t("addTask")}
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
          {t("notFound")}
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <Badge variant={statusColors[task.status as TaskStatus]}>
                    {t(`statusLabels.${task.status as TaskStatus}`)}
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
                    {t("dueDate", {
                      date: new Date(task.dueDate).toLocaleDateString(
                        getLocaleForDate(i18n.language)
                      ),
                    })}
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
                      <title>{tCommon("edit")}</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {tCommon("edit")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(task.id)}>
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>{tCommon("delete")}</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {tCommon("delete")}
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
            <DialogTitle>{t("newTask")}</DialogTitle>
            <DialogDescription>{t("newTaskDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("taskTitle")}</Label>
              <Input
                id="title"
                placeholder={t("taskTitlePlaceholder")}
                value={newTaskTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTaskTitle(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("descriptionOptional")}</Label>
              <Textarea
                id="description"
                placeholder={t("descriptionPlaceholder")}
                value={newTaskDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewTaskDescription(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("status")}</Label>
              <div className="flex gap-2">
                {(["pending", "in_progress", "completed"] as TaskStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={newTaskStatus === status ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setNewTaskStatus(status)}
                    className="flex-1"
                  >
                    {t(`statusLabels.${status}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="primary" onClick={handleAddTask}>
              {t("createTask")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={editingTask !== null} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogClose onClick={() => setEditingTask(null)} />
          <DialogHeader>
            <DialogTitle>{t("editTask")}</DialogTitle>
            <DialogDescription>{t("editTaskDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t("taskTitle")}</Label>
              <Input
                id="edit-title"
                placeholder={t("taskTitlePlaceholder")}
                value={editingTask?.title || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t("descriptionOptional")}</Label>
              <Textarea
                id="edit-description"
                placeholder={t("descriptionPlaceholder")}
                value={editingTask?.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">{t("status")}</Label>
              <div className="flex gap-2">
                {(["pending", "in_progress", "completed"] as TaskStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={editingTask?.status === status ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setEditingTask((prev) => (prev ? { ...prev, status } : null))}
                    className="flex-1"
                  >
                    {t(`statusLabels.${status}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="primary" onClick={handleEditTask}>
              {tCommon("save")}
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
            <DialogTitle>{t("deleteTask")}</DialogTitle>
            <DialogDescription>{t("deleteTaskConfirm")}</DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingTaskId(null);
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              {tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
