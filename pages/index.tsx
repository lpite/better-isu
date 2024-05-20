import MobileNavigation from '@/components/mobile-navigation'
import ScheduleCarousel from '@/components/schedule-carousel'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import useSession from 'hooks/useSession'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { trpc } from 'trpc/trpc-client'
import getSession from 'utils/getSession'

function checkIfBirthDay(birthDate?: string) {

  if (!birthDate) {
    return false
  }

  const now = new Date();
  const [day, month] = birthDate.split(".");
  if (now.getMonth() + 1 === Number(month) && now.getDate() === Number(day)) {
    return true
  }
  return false
}


export const getServerSideProps: GetServerSideProps = async ({
  req
}) => {
  
  const s = await getSession(req as any);
  if (!s.data) {
    return {
      redirect: {
        destination: "/login",
        permanent: false
      }
    }
  }
  return {
    props: {

    }
  }

}

export default function Home() {

  const [testJournal, setTestJournal] = useState(false)

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

    // if (error === "unauthorized") {
    //   router.push("/login")
    // }

    const jrnT = localStorage.getItem("test_journal");
    if (jrnT === "true") {
      setTestJournal(true)
    } else {
      setTestJournal(false)
    }

  }, [user, router, isLoadingUser, isLoadingSession, data, error])

  const isLoading = isLoadingSubjects;

  return (
    <main className='py-4 px-2'>
      <h1 className='text-2xl font-bold mb-10'>{checkIfBirthDay(user?.birthDate) ? "З днем народження!" : "Привіт"} {user?.name}</h1>

      <h2 className='text-xl text-slate-400'>Поточний семестр</h2>
      <div className='flex flex-wrap gap-2 mb-14'>
        {isLoading ? <>{
          Array(5).fill("").map((_, i) => (
            <Card className='w-full shrink-0 animate-pulse bg-slate-700' style={{ height: 73 }} key={i}>
              <CardContent className="p-8"></CardContent>
            </Card>
          ))
        }</> : null}

        {!isLoading && subjects && subjects?.map((el, i) => (
          <a href={testJournal ? `/journal?index=${i}` : `/api/journal?index=${i}`} key={el.name + i} target='_blank' className='flex w-full border rounded-lg py-5 px-3'>{el.name}</a>
        ))}

        <ScheduleCarousel subjects={subjects} />
      </div>
      <MobileNavigation />
    </main>
  )
}
