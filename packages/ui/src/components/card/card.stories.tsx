import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Card, CardContent, CardFooter, CardHeader } from "./card";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-sm text-secondary-500">Card description</p>
      </CardHeader>
      <CardContent>
        <p>This is the card content. You can put any content here.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card with Footer</h3>
        <p className="text-sm text-secondary-500">This card has a footer with actions</p>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is a typical card layout.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-80 p-6">
      <p>A simple card with just content and no header or footer.</p>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold">JD</span>
          </div>
          <div>
            <h3 className="font-semibold">John Doe</h3>
            <p className="text-sm text-secondary-500">Software Engineer</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-secondary-600">
          Building great products with React and TypeScript.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const FeatureCards: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="w-64">
        <CardHeader>
          <h3 className="font-semibold">Feature 1</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary-600">Description of the first feature.</p>
        </CardContent>
      </Card>
      <Card className="w-64">
        <CardHeader>
          <h3 className="font-semibold">Feature 2</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary-600">Description of the second feature.</p>
        </CardContent>
      </Card>
      <Card className="w-64">
        <CardHeader>
          <h3 className="font-semibold">Feature 3</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary-600">Description of the third feature.</p>
        </CardContent>
      </Card>
    </div>
  ),
};
