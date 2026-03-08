import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: "info",
  },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>This is an informational message for the user.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  args: {
    variant: "success",
  },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  args: {
    variant: "warning",
  },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>Please review your input before proceeding.</AlertDescription>
    </Alert>
  ),
};

export const ErrorVariant: Story = {
  args: {
    variant: "error",
  },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="info">
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>This is an informational message.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Operation completed successfully.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Please proceed with caution.</AlertDescription>
      </Alert>
      <Alert variant="error">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>An error has occurred.</AlertDescription>
      </Alert>
    </div>
  ),
};
