import {
  IonApp,
  IonRouterOutlet,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";

import HomePage from "./pages/Home";
import GroupPage from "./pages/Group";
import AddExpensePage from "./pages/AddExpense";

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/group/:groupId" component={GroupPage} />
          <Route exact path="/group/:groupId/add-expense" component={AddExpensePage} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
