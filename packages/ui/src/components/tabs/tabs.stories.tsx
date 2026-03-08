import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Account</TabsTrigger>
        <TabsTrigger value="tab2">Password</TabsTrigger>
        <TabsTrigger value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4 text-secondary-700">
          <h3 className="font-semibold">Account Settings</h3>
          <p className="mt-2">Manage your account details and preferences here.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4 text-secondary-700">
          <h3 className="font-semibold">Password Settings</h3>
          <p className="mt-2">Update your password and security options.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4 text-secondary-700">
          <h3 className="font-semibold">General Settings</h3>
          <p className="mt-2">Configure your application preferences.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="rounded-lg border border-secondary-200 p-4">
          <p>This is the overview content.</p>
        </div>
      </TabsContent>
      <TabsContent value="details">
        <div className="rounded-lg border border-secondary-200 p-4">
          <p>This is the detailed content with more information.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="another">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <div className="p-4">Active tab content</div>
      </TabsContent>
      <TabsContent value="another">
        <div className="p-4">Another tab content</div>
      </TabsContent>
    </Tabs>
  ),
};
