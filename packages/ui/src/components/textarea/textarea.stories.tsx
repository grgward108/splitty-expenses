import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Enter your message...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue:
      "This is a sample text that spans multiple lines.\n\nIt demonstrates the textarea component.",
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Enter your message...",
    error: "This field is required",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
  },
};

export const CustomRows: Story = {
  args: {
    placeholder: "Larger textarea...",
    rows: 6,
  },
};
