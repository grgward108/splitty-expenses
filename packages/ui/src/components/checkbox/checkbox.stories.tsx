import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {},
};

export const WithLabel: Story = {
  args: {
    label: "Accept terms and conditions",
  },
};

export const Checked: Story = {
  args: {
    label: "Checked by default",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled checkbox",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Disabled and checked",
    disabled: true,
    defaultChecked: true,
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-3">
      <Checkbox label="Email notifications" defaultChecked />
      <Checkbox label="SMS notifications" />
      <Checkbox label="Push notifications" defaultChecked />
    </div>
  ),
};
