import { Button } from '@mantine/core'
import Link from 'next/link'
import React from 'react'
import * as Admin from "@/app/features/admin/components/Index"
import { getArrivals } from '@/api'
// import ArrivalList from '../features/admin/components/ArrivalList'

export default async function AdminHome() {

  const arrivals = await getArrivals();
  return (
    <div>
        <div className="flex mt-10">
            <Link href={"/admin/arrival"} className="flex-1 mx-2 mr-10 h-fit">
                <Admin.ArrivalModeButton/>
            </Link>
            <Link href={"/admin/edit"} className="flex-1 mx-2 ml-10 h-fit">
                <Admin.EditModeButton/>
            </Link>
        </div>
        <div className="mt-10">
            <Admin.ArrivalList arrivals={arrivals}/>
        </div>
        <div className="absolute bottom-5">
          <Link href={"/"}>
            <Button fullWidth variant="filled" color='blue'>購入モード</Button>
          </Link>
        </div>
        <div className='mt-4 flex justify-end'>
          <Link href={"/admin/payout"} className='mr-5'>
            <Button fullWidth variant="filled" color='red'>梶研Pay払い出し</Button>
          </Link>
          <Admin.TestSound/>
        </div>
    </div>
  )
}