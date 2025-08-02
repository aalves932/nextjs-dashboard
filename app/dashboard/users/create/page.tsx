import Form from "@/app/ui/users/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Usuários", href: "/dashboard/users" },
          {
            label: "Criar Usuário",
            href: "/dashboard/users/create",
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
