'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from 'bcrypt';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const formSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = formSchema.omit({ id: true, date: true });
const UpdateInvoice = formSchema.omit({ id: true, date: true });

// User schema
const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const CreateUser = userSchema.omit({ id: true });
const UpdateUser = userSchema.omit({ id: true });

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function createInvoice(formData: FormData) {

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}

// User actions
export async function createUser(formData: FormData) {
  const { name, email, password } = CreateUser.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user.');
  }

  revalidatePath('/dashboard/users');
  redirect('/dashboard/users');
}

export async function updateUser(id: string, formData: FormData) {
  const { name, email, password } = UpdateUser.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  try {
    // Se uma nova senha foi fornecida, fazer hash dela
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}, password = ${hashedPassword}
        WHERE id = ${id}
      `;
    } else {
      // Atualizar sem alterar a senha
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}
        WHERE id = ${id}
      `;
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user.');
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteUser(id: string) {
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    revalidatePath("/dashboard/users");
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user.');
  }
}