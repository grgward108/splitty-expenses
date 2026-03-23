import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useTranslation } from "@repo/i18n";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  Heading,
  Label,
  Switch,
  Text,
} from "@repo/ui";
import { camera, logOutOutline, moon, sunny } from "ionicons/icons";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";

function SettingsPage() {
  const { signOut } = useAuth();
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const { i18n } = useTranslation();
  const [isSigningOut, setIsSigningOut] = useState(false);
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
      title: t("mobile.settingsUpdated"),
      message: newValue ? t("mobile.darkModeEnabled") : t("mobile.darkModeDisabled"),
    });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      setIsSigningOut(false);
    }
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
          title: t("mobile.photoSavedTitle"),
          message: t("mobile.photoSavedMessage"),
        });
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : tCommon("unknownError");
      if (!errorMessage.includes("cancelled") && !errorMessage.includes("User cancelled")) {
        setAlertMessage({
          type: "error",
          title: t("mobile.captureFailedTitle"),
          message: errorMessage,
        });
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const languageValue = i18n.language.startsWith("ja") ? "ja" : "en";

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div className="space-y-8 pb-8">
          <section className="space-y-3">
            <Heading
              level={4}
              className="px-1 text-secondary-500 dark:text-secondary-400 uppercase text-xs tracking-widest font-bold"
            >
              {t("language")}
            </Heading>
            <Card variant="modern" className="overflow-hidden p-4">
              <div className="space-y-2">
                <Label htmlFor="language-select-mobile">{t("language")}</Label>
                <select
                  id="language-select-mobile"
                  value={languageValue}
                  onChange={(e) => void i18n.changeLanguage(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-950 dark:text-secondary-100"
                >
                  <option value="ja">{t("languageJa")}</option>
                  <option value="en">{t("languageEn")}</option>
                </select>
                <Text size="sm" color="muted">
                  {t("languageDescription")}
                </Text>
              </div>
            </Card>
          </section>

          <section className="space-y-3">
            <Heading
              level={4}
              className="px-1 text-secondary-500 dark:text-secondary-400 uppercase text-xs tracking-widest font-bold"
            >
              {t("mobile.appearance")}
            </Heading>
            <Card variant="modern" className="overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25">
                    <IonIcon icon={isDark ? moon : sunny} className="text-2xl" />
                  </div>
                  <div>
                    <Text weight="semibold" className="text-secondary-900 dark:text-secondary-100">
                      {t("mobile.darkMode")}
                    </Text>
                    <Text size="sm" color="muted">
                      {isDark ? t("mobile.on") : t("mobile.off")}
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
              {t("mobile.camera")}
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
                        {t("mobile.takePhoto")}
                      </Text>
                      <Text size="sm" color="muted">
                        {t("mobile.takePhotoHint")}
                      </Text>
                    </div>
                  </div>
                </div>

                <Button onClick={handleTakePhoto} disabled={isCapturing} className="w-full">
                  {isCapturing ? t("mobile.capturing") : t("mobile.launchCamera")}
                </Button>

                {capturedPhoto && (
                  <div className="space-y-2">
                    <Text size="sm" color="muted">
                      {t("mobile.lastPhoto")}
                    </Text>
                    <img
                      src={capturedPhoto}
                      alt={t("mobile.capturedPhotoAlt")}
                      className="w-full rounded-xl object-cover aspect-video"
                    />
                  </div>
                )}
              </div>
            </Card>
          </section>
          <section className="space-y-3">
            <Heading
              level={4}
              className="px-1 text-secondary-500 dark:text-secondary-400 uppercase text-xs tracking-widest font-bold"
            >
              {t("mobile.account")}
            </Heading>
            <Card variant="modern" className="overflow-hidden p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25">
                  <IonIcon icon={logOutOutline} className="text-2xl" />
                </div>
                <div>
                  <Text weight="semibold" className="text-secondary-900 dark:text-secondary-100">
                    {t("mobile.signOut")}
                  </Text>
                  <Text size="sm" color="muted">
                    {t("mobile.signOutHint")}
                  </Text>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full"
              >
                {isSigningOut ? t("mobile.signingOut") : t("mobile.signOut")}
              </Button>
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
