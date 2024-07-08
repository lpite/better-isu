import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"

import { z } from "zod"
import { useForm } from "react-hook-form"
import React from "react"
import { useRouter } from "next/router"
import { Input } from "@/components/ui/input"
import { LoginResponse } from "./api/login"
import { useGetAuthSession } from "orval/default/default"

const formSchema = z.object({
  login: z.string().min(2).max(50),
  password: z.string().min(2).max(50),

})

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const {
    data: session,
    isLoading: isLoadingSession,
    isValidating: isValidatingSession
  } = useGetAuthSession()

  React.useEffect(() => {
    if (!isLoadingSession && !isValidatingSession && session?.data) {
      router.push("/")
    }
  }, [router, isLoadingSession, isValidatingSession, session])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const res: LoginResponse | undefined = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => res.json())
      .finally(() => {
        setIsLoading(false)
      })

    if (res?.error) {
      setError(res.error);
    }

    if (res?.data || res?.error === "already") {
      router.push("/")
    }

  }
  return (
    <main className="flex justify-center items-center h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ minWidth: 300 }}>
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Логін</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" type="text" {...field} className="text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input placeholder="**********" type="password" {...field} className="text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span className="text-red-400">{error}</span>
          
          <Button type="submit" className="w-full" disabled={isLoading}>Увійти</Button>
        </form>
      </Form>

    </main>
  )
}

