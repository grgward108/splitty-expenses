import { authClient } from "@/lib/auth-client";
import { IonContent, IonPage } from "@ionic/react";
import { Button, Text } from "@repo/ui";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

function LoginPage() {
  const history = useHistory();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      history.replace("/tasks");
    }
  }, [session, isPending, history]);

  const handleSignInWithGoogle = () => {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost:8100";
    authClient.signIn.social({
      provider: "google",
      callbackURL: `${base}/tasks`,
    });
  };

  if (isPending) {
    return (
      <IonPage>
        <IonContent fullscreen className="ion-padding">
          <div className="flex min-h-[50vh] items-center justify-center">
            <Text color="muted">読み込み中...</Text>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (session?.user) {
    return null;
  }

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
            onClick={handleSignInWithGoogle}
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
