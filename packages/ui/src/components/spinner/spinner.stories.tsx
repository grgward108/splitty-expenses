import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Card, CardContent } from "../card";
import { Spinner } from "./spinner";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "スピナーのサイズ",
    },
    className: {
      control: "text",
      description: "追加のCSSクラス",
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const CustomColor: Story = {
  args: {
    size: "md",
    className: "text-red-500",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-secondary-500">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <span className="text-sm text-secondary-500">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-sm text-secondary-500">Large</span>
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner className="text-primary-600" />
      <Spinner className="text-secondary-600" />
      <Spinner className="text-red-500" />
      <Spinner className="text-green-500" />
      <Spinner className="text-yellow-500" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <Spinner size="sm" className="mr-2 text-white" />
        Processing...
      </Button>
      <Button variant="outline" disabled>
        <Spinner size="sm" className="mr-2" />
        Loading...
      </Button>
    </div>
  ),
};

export const LoadingCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" />
        <p className="mt-4 text-secondary-500">Loading content...</p>
      </CardContent>
    </Card>
  ),
};

export const FullPageLoader: Story = {
  render: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-lg font-medium text-secondary-600">Loading application...</p>
      </div>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};
