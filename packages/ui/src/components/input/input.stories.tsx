import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "プレースホルダーテキスト",
    },
    error: {
      control: "text",
      description: "エラーメッセージ",
    },
    disabled: {
      control: "boolean",
      description: "無効状態",
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
      description: "入力タイプ",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Hello, World!",
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Enter email...",
    error: "Please enter a valid email address",
    defaultValue: "invalid-email",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password...",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "Enter email...",
  },
};

export const NumberInput: Story = {
  args: {
    type: "number",
    placeholder: "Enter number...",
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
          Name
        </label>
        <Input id="name" placeholder="Enter your name" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
          Email
        </label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
          Password
        </label>
        <Input id="password" type="password" placeholder="Enter password" />
      </div>
      <div>
        <label htmlFor="error-field" className="block text-sm font-medium text-secondary-700 mb-1">
          Field with Error
        </label>
        <Input id="error-field" error="This field is required" placeholder="Required field" />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input placeholder="Default state" />
      <Input placeholder="With value" defaultValue="Some value" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="With error" error="Error message" />
    </div>
  ),
};
