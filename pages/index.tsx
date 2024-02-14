import { LoginPage } from '@/components/login-page'
import MobileNavigation from '@/components/mobile-navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useSession from 'hooks/useSession'
import { useRouter } from 'next/router'
import React from 'react'

import { trpc } from 'trpc/trpc-client'
import { isArray } from 'util'

export default function Home() {
  const router = useRouter()
  const {
    isLoading,
    data,
    error
  } = useSession()

  const {
    data: user,
    isLoading: isLoadingUser
  } = trpc.user.profile.useQuery()

  const {
    data: subjects,
    isLoading: isLoadingSubjects
  } = trpc.user.subjects.useQuery()

  React.useEffect(() => {
    if (!user && !isLoadingUser) {
      router.push("/login")
    }
    if (!isLoading && !data) {
      router.push("/login")
    }
  }, [user, router, isLoadingUser, isLoading, data, error])


  return (
    <main className='py-4 px-2'>
      <h1 className='text-2xl font-bold mb-10'>Привіт {user?.name2}</h1>

      <h1 className='text-xl text-slate-400'>Поточний семестр</h1>
      <div className='flex flex-wrap gap-2 mb-14'>
        {!isLoadingSubjects && isArray(subjects) && subjects?.map((el, i) => (
          <Card className='w-full shrink-0' key={i}>
            <CardHeader>
              <CardContent className="p-0"><a href={"/api/journal?key=" + el.link} target='_blank'>{el.name}</a></CardContent>
            </CardHeader>
          </Card>
        ))}
  
      </div>
      <MobileNavigation />
    </main>
  )
}
