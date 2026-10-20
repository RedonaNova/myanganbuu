import type { Metadata } from "next";
import { WorksView } from "@/components/site/works-view";
import { projectsPage as t } from "@/messages/mn";

export const metadata: Metadata = {
  title: t.title,
  description: t.intro,
  alternates: { canonical: "/ajluud" },
};

export default function WorksPage() {
  return <WorksView />;
}
