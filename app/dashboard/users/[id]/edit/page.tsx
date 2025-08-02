import Form from "@/app/ui/users/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchUserById } from "@/app/lib/data";

export default async function Page(props: {params: Promise<{ id: string }>}) {
  
  const params = await props.params;
  const id = params.id;
  const user = await fetchUserById(id);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Usuários", href: "/dashboard/users" },
          {
            label: "Editar Usuário",
            href: `/dashboard/users/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form user={user} />
    </main>
  );
}
