import type { Meta, StoryObj } from "@storybook/react";
import { Code } from "./code";

const meta: Meta<typeof Code> = {
  title: "Components/Code",
  component: Code,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Code>;

export const Default: Story = {
  args: {
    children: "npm install",
  },
};

export const InParagraph: Story = {
  render: () => (
    <p className="text-secondary-700">
      Run <Code>npm install @repo/ui</Code> to install the package.
    </p>
  ),
};

export const VariableExample: Story = {
  render: () => (
    <p className="text-secondary-700">
      The <Code>className</Code> prop accepts any valid CSS class string.
    </p>
  ),
};

export const FunctionExample: Story = {
  render: () => (
    <p className="text-secondary-700">
      Use <Code>useState()</Code> for local component state.
    </p>
  ),
};

export const MultipleInText: Story = {
  render: () => (
    <p className="text-secondary-700">
      Import <Code>Button</Code> and <Code>Card</Code> from <Code>@repo/ui</Code> to use them in
      your project.
    </p>
  ),
};
