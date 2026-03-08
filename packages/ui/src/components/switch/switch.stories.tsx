import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "スイッチのオン/オフ状態",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "スイッチのサイズ",
    },
    label: {
      control: "text",
      description: "スイッチのラベル",
    },
    disabled: {
      control: "boolean",
      description: "無効状態",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const WithLabel: Story = {
  args: {
    checked: false,
    label: "ダークモード",
  },
};

export const WithLabelChecked: Story = {
  args: {
    checked: true,
    label: "ダークモード",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    checked: true,
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    checked: true,
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

// インタラクティブなストーリー
const InteractiveSwitch = () => {
  const [checked, setChecked] = useState(false);
  return (
    <Switch checked={checked} onCheckedChange={setChecked} label={checked ? "オン" : "オフ"} />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveSwitch />,
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Switch size="sm" checked label="Small" />
        <Switch size="md" checked label="Medium" />
        <Switch size="lg" checked label="Large" />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Switch checked={false} label="オフ" />
        <Switch checked={true} label="オン" />
      </div>
      <div className="flex items-center gap-4">
        <Switch disabled checked={false} label="無効（オフ）" />
        <Switch disabled checked={true} label="無効（オン）" />
      </div>
    </div>
  ),
};
