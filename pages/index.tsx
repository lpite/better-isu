import MobileNavigation from '@/components/mobile-navigation'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import useSession from 'hooks/useSession'
import { useRouter } from 'next/router'
import React from 'react'

import { trpc } from 'trpc/trpc-client'

export default function Home() {
  const router = useRouter()
  const {
    isLoading: isLoadingSession,
    data,
    error
  } = useSession()

  const {
    data: user,
    isLoading: isLoadingUser,
  } = trpc.user.profile.useQuery()

  const {
    data: subjects,
    isLoading: isLoadingSubjects,
  } = trpc.user.subjects.useQuery()

  React.useEffect(() => {
    if (!user && !isLoadingUser) {
      router.push("/login")
    }
    if (!isLoadingSession && !data) {
      router.push("/login")
    }
  }, [user, router, isLoadingUser, isLoadingSession, data, error])

  const isLoading = isLoadingSubjects;

  return (
    <main className='py-4 px-2'>
      <h1 className='text-2xl font-bold mb-10'>Привіт {user?.name}</h1>

      <h1 className='text-xl text-slate-400'>Поточний семестр</h1>
      <div className='flex flex-wrap gap-2 mb-14'>
        {isLoading ? <>{
          Array(5).fill("").map((_, i) => (
            <Card className='w-full shrink-0 animate-pulse bg-slate-700' style={{ height: 73 }} key={i}>
              <CardContent className="p-8"></CardContent>
            </Card>
          ))
        }</> : null}

        {!isLoading && subjects?.map((el, i) => (
          <Card className='w-full shrink-0 border_animation' key={i}>
            <CardContent className="py-6"><a href={"/api/journal?index=" + i} target='_blank'>{el.name}</a></CardContent>
          </Card>
        ))}
  
      </div>
      <MobileNavigation />
    </main>
  )
}
