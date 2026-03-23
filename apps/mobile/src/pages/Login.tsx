import { IonContent, IonPage } from "@ionic/react";
import { useTranslation } from "@repo/i18n";
import { Button, Text } from "@repo/ui";

import { useAuth } from "@/hooks/use-auth";

function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-6 px-4">
          <Text className="text-2xl font-bold">{tCommon("login")}</Text>
          <Text color="muted" className="text-center">
            {t("signInHintMobile")}
          </Text>
          <Button
            variant="primary"
            onClick={signInWithGoogle}
            className="w-full max-w-xs rounded-xl"
          >
            {t("signInWithGoogle")}
          </Button>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default LoginPage;
