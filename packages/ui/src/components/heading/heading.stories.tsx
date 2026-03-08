import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./heading";

const meta: Meta<typeof Heading> = {
  title: "Components/Heading",
  component: Heading,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const H1: Story = {
  args: {
    level: 1,
    children: "Heading Level 1",
  },
};

export const H2: Story = {
  args: {
    level: 2,
    children: "Heading Level 2",
  },
};

export const H3: Story = {
  args: {
    level: 3,
    children: "Heading Level 3",
  },
};

export const H4: Story = {
  args: {
    level: 4,
    children: "Heading Level 4",
  },
};

export const H5: Story = {
  args: {
    level: 5,
    children: "Heading Level 5",
  },
};

export const H6: Story = {
  args: {
    level: 6,
    children: "Heading Level 6",
  },
};

export const AllLevels: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading level={1}>Heading Level 1</Heading>
      <Heading level={2}>Heading Level 2</Heading>
      <Heading level={3}>Heading Level 3</Heading>
      <Heading level={4}>Heading Level 4</Heading>
      <Heading level={5}>Heading Level 5</Heading>
      <Heading level={6}>Heading Level 6</Heading>
    </div>
  ),
};

export const CustomElement: Story = {
  args: {
    level: 1,
    as: "span",
    children: "H1 styled as span",
  },
};
