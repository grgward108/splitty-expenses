import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Email Address",
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <input
        id="email"
        type="email"
        className="flex h-10 w-full rounded-md border border-secondary-300 px-3 py-2 text-sm"
        placeholder="Enter your email"
      />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <Label>
      Username <span className="text-red-500">*</span>
    </Label>
  ),
};
