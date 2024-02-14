
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

const formSchema = z.object({
  login: z.string().min(2).max(50),
  password: z.string().min(2).max(50),

})

export default function LoginPage() {
  const router = useRouter()
  React.useEffect(() => {
    fetch("/api/session", {
      credentials: "include"
    }).then(res => res.json())
      .then((res) => {
        if (res.data) {
          router.push("/profile/")
        }
      })
  }, [router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => res.json())

    if (res.data || res.error === "already") {
      router.push("/profile/")
    }

    console.log(values)
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
                <FormLabel>Login</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" type="text" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="**********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </Form>
   
    </main>
  )
}

