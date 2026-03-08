import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) => (
    <div className="w-64">
      <div className="text-sm">Above</div>
      <Separator {...args} className="my-4" />
      <div className="text-sm">Below</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="flex h-10 items-center gap-4">
      <span className="text-sm">Left</span>
      <Separator {...args} />
      <span className="text-sm">Right</span>
    </div>
  ),
};
