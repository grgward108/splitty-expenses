import { IonApp, IonIcon, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { checkboxOutline, settings } from "ionicons/icons";
import { Redirect, Route } from "react-router-dom";

import SettingsPage from "./pages/Settings";
import TasksPage from "./pages/Tasks";

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tasks" component={TasksPage} />
            <Route exact path="/settings" component={SettingsPage} />
            <Route exact path="/">
              <Redirect to="/tasks" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar
            slot="bottom"
            className="bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700"
          >
            <IonTabButton
              tab="tasks"
              href="/tasks"
              className="text-secondary-500 dark:text-secondary-400 [&.tab-selected]:text-primary-600 dark:[&.tab-selected]:text-primary-400"
            >
              <IonIcon icon={checkboxOutline} />
            </IonTabButton>
            <IonTabButton
              tab="settings"
              href="/settings"
              className="text-secondary-500 dark:text-secondary-400 [&.tab-selected]:text-primary-600 dark:[&.tab-selected]:text-primary-400"
            >
              <IonIcon icon={settings} />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
