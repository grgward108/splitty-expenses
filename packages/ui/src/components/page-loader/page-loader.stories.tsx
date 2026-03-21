import type { Meta, StoryObj } from "@storybook/react";
import { PageLoader } from "./page-loader";

const meta: Meta<typeof PageLoader> = {
  title: "Components/PageLoader",
  component: PageLoader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageLoader>;

export const Default: Story = {
  args: {},
};

export const CustomMessage: Story = {
  args: {
    message: "データを取得しています...",
    subMessage: "しばらくお待ちください",
  },
};

export const WithoutSubMessage: Story = {
  args: {
    subMessage: "",
  },
};
