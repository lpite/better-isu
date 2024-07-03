import MobileNavigation from '@/components/mobile-navigation'
import ScheduleCarousel from '@/components/schedule-carousel'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { Fragment } from 'react'

import { useGetAuthSession, useGetUserProfile, useGetUserSubjects } from "orval/default/default"

import zod from "zod"
import Head from 'next/head'

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

const journalTypeSchema = zod.enum(["default", "new"])

export default function Home() {

  const [journalType, setJournalType] = React.useState<"default" | "new">("default") 

  const router = useRouter()

  const {
    isLoading: isLoadingSession,
    data: session,
    error
  } = useGetAuthSession()

  const {
    data: user,
    isLoading: isLoadingUser,
  } = useGetUserProfile()

  const {
    data: subjects,
    isLoading: isLoadingSubjects,
  } = useGetUserSubjects()

  React.useEffect(() => {
    if (!user && !isLoadingUser) {
      router.push("/login")
    }
    if (!isLoadingSession && !session?.data) {
      router.push("/login")
    }
  }, [user, router, isLoadingUser, isLoadingSession, session, error])

  React.useEffect(() => {
    const journalType = journalTypeSchema.parse(localStorage.getItem("journalType") || "default")

    setJournalType(journalType);

  }, [])

  const isLoading = isLoadingSubjects;

  return (
    <main className='py-4 px-2'>
      <Head>
        <link rel="preload" href="/api/hono/user/profile" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/hono/user/subjects" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/hono/user/schedule" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/hono/auth/session" as="fetch" crossOrigin="anonymous" />
      </Head>
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
          <Fragment key={el.name + i}>
            {journalType === "new" ? 
              <Link 
                href={`/journal?index=${i}`}    
              >
                <a className='flex w-full border rounded-lg py-5 px-3'>
                  
                  {el.name}
                </a>
              </Link> 
              :
              <a 
                href={`/api/journal?index=${i}`} 
                target='_blank' 
                className='flex w-full border rounded-lg py-5 px-3'>
                {el.name}
              </a>
            }
          </Fragment>
        ))}

        <ScheduleCarousel subjects={subjects || []} />
      </div>
      <MobileNavigation />
    </main>
  )
}
