import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./text";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: "This is a default text paragraph.",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-2">
      <Text size="xs">Extra small text (xs)</Text>
      <Text size="sm">Small text (sm)</Text>
      <Text size="md">Medium text (md) - Default</Text>
      <Text size="lg">Large text (lg)</Text>
      <Text size="xl">Extra large text (xl)</Text>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="space-y-2">
      <Text weight="normal">Normal weight text</Text>
      <Text weight="medium">Medium weight text</Text>
      <Text weight="semibold">Semibold weight text</Text>
      <Text weight="bold">Bold weight text</Text>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="space-y-2">
      <Text color="default">Default color text</Text>
      <Text color="muted">Muted color text</Text>
      <Text color="primary">Primary color text</Text>
      <Text color="error">Error color text</Text>
    </div>
  ),
};

export const Combined: Story = {
  render: () => (
    <div className="space-y-4">
      <Text size="lg" weight="bold" color="primary">
        Large, bold, primary text
      </Text>
      <Text size="sm" weight="medium" color="muted">
        Small, medium, muted text
      </Text>
      <Text size="xl" weight="semibold">
        Extra large, semibold text
      </Text>
    </div>
  ),
};

export const AsSpan: Story = {
  render: () => (
    <Text as="span" size="sm" color="muted">
      This renders as a span element
    </Text>
  ),
};
