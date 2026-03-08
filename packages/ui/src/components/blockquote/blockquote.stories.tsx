import type { Meta, StoryObj } from "@storybook/react";
import { Blockquote } from "./blockquote";

const meta: Meta<typeof Blockquote> = {
  title: "Components/Blockquote",
  component: Blockquote,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Blockquote>;

export const Default: Story = {
  args: {
    children: "This is a quoted text that provides additional context or reference.",
  },
};

export const LongQuote: Story = {
  args: {
    children:
      "The best way to predict the future is to invent it. This is a longer quote that demonstrates how the blockquote component handles multiple lines of text.",
  },
};

export const WithAttribution: Story = {
  render: () => (
    <figure>
      <Blockquote>The only way to do great work is to love what you do.</Blockquote>
      <figcaption className="mt-2 text-sm text-secondary-500">— Steve Jobs</figcaption>
    </figure>
  ),
};

export const Nested: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-secondary-700">Here is what the documentation says:</p>
      <Blockquote>
        Components should be composable, reusable, and well-documented. Each component should have a
        single responsibility and be easy to test.
      </Blockquote>
      <p className="text-secondary-700">This principle guides our component design.</p>
    </div>
  ),
};
