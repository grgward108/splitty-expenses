import { type ReactElement, createElement } from "react";
import { WelcomeEmail } from "./templates/welcome.js";

/** API など JSX なし環境からテストメール用の React 要素を組み立てる */
export function renderTestWelcomeEmail(name: string): ReactElement {
  return createElement(WelcomeEmail, { name });
}
