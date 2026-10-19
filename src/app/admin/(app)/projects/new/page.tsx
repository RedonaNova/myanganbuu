import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { NewProjectForm } from "./new-project-form";
import { admin } from "@/messages/mn";

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title={admin.projects.newTitle} backHref="/admin/projects" />
      <NewProjectForm />
    </>
  );
}
