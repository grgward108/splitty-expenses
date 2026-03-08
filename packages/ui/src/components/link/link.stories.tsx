import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./link";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: "#",
    children: "Default link",
  },
};

export const Muted: Story = {
  args: {
    href: "#",
    variant: "muted",
    children: "Muted link",
  },
};

export const External: Story = {
  args: {
    href: "https://example.com",
    external: true,
    children: "External link",
  },
};

export const ExternalMuted: Story = {
  args: {
    href: "https://example.com",
    variant: "muted",
    external: true,
    children: "External muted link",
  },
};

export const InParagraph: Story = {
  render: () => (
    <p className="text-secondary-700">
      This is a paragraph with an <Link href="#">inline link</Link> inside it. You can also have{" "}
      <Link href="https://example.com" external>
        external links
      </Link>{" "}
      that open in a new tab.
    </p>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-x-4">
        <Link href="#">Default</Link>
        <Link href="#" variant="muted">
          Muted
        </Link>
      </div>
      <div className="space-x-4">
        <Link href="https://example.com" external>
          External Default
        </Link>
        <Link href="https://example.com" variant="muted" external>
          External Muted
        </Link>
      </div>
    </div>
  ),
};
