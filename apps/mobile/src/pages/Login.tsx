import { IonContent, IonPage } from "@ionic/react";
import { Button, Text } from "@repo/ui";

import { useAuth } from "@/hooks/use-auth";

function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-6 px-4">
          <Text className="text-2xl font-bold">ログイン</Text>
          <Text color="muted" className="text-center">
            Google アカウントでサインインしてください
          </Text>
          <Button
            variant="primary"
            onClick={signInWithGoogle}
            className="w-full max-w-xs rounded-xl"
          >
            Google でサインイン
          </Button>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default LoginPage;
