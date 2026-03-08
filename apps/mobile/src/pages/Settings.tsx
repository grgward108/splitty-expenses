import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { Alert, AlertDescription, AlertTitle, Button, Card, Heading, Switch, Text } from "@repo/ui";
import { camera, moon, sunny } from "ionicons/icons";
import { useEffect, useState } from "react";

function SettingsPage() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) {
        return saved === "true";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "info" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(isDark));
  }, [isDark]);

  const handleDarkModeToggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    setAlertMessage({
      type: "success",
      title: "設定が更新されました",
      message: `ダークモードが${newValue ? "有効" : "無効"}になりました。`,
    });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleTakePhoto = async () => {
    setIsCapturing(true);
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: true,
      });

      if (photo.webPath) {
        setCapturedPhoto(photo.webPath);
        setAlertMessage({
          type: "success",
          title: "写真を保存しました",
          message: "撮影した写真がフォトライブラリに保存されました。",
        });
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      if (!errorMessage.includes("cancelled") && !errorMessage.includes("User cancelled")) {
        setAlertMessage({
          type: "error",
          title: "撮影に失敗しました",
          message: errorMessage,
        });
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div className="space-y-8 pb-8">
          <section className="space-y-3">
            <Heading
              level={4}
              className="px-1 text-secondary-500 dark:text-secondary-400 uppercase text-xs tracking-widest font-bold"
            >
              外観
            </Heading>
            <Card variant="modern" className="overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25">
                    <IonIcon icon={isDark ? moon : sunny} className="text-2xl" />
                  </div>
                  <div>
                    <Text weight="semibold" className="text-secondary-900 dark:text-secondary-100">
                      ダークモード
                    </Text>
                    <Text size="sm" color="muted">
                      {isDark ? "オン" : "オフ"}
                    </Text>
                  </div>
                </div>

                <Switch checked={isDark} onCheckedChange={handleDarkModeToggle} />
              </div>
            </Card>
          </section>
          <section className="space-y-3">
            <Heading
              level={4}
              className="px-1 text-secondary-500 dark:text-secondary-400 uppercase text-xs tracking-widest font-bold"
            >
              カメラ
            </Heading>
            <Card variant="modern" className="overflow-hidden p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25">
                      <IonIcon icon={camera} className="text-2xl" />
                    </div>
                    <div>
                      <Text
                        weight="semibold"
                        className="text-secondary-900 dark:text-secondary-100"
                      >
                        写真を撮影
                      </Text>
                      <Text size="sm" color="muted">
                        撮影した写真はフォトライブラリに保存されます
                      </Text>
                    </div>
                  </div>
                </div>

                <Button onClick={handleTakePhoto} disabled={isCapturing} className="w-full">
                  {isCapturing ? "撮影中..." : "カメラを起動"}
                </Button>

                {capturedPhoto && (
                  <div className="space-y-2">
                    <Text size="sm" color="muted">
                      最後に撮影した写真:
                    </Text>
                    <img
                      src={capturedPhoto}
                      alt="撮影した写真"
                      className="w-full rounded-xl object-cover aspect-video"
                    />
                  </div>
                )}
              </div>
            </Card>
          </section>
          {alertMessage && (
            <Alert
              variant={alertMessage.type}
              className="rounded-2xl border-none shadow-lg animate-fade-in"
            >
              <AlertTitle>{alertMessage.title}</AlertTitle>
              <AlertDescription>{alertMessage.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default SettingsPage;
