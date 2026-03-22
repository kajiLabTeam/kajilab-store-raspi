"use client"
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import * as Kajilabpay from "@/app/features/kajilabpay/components/Index"
import { getUser, updateUserDebt } from '@/api';
import { Notifications, notifications } from '@mantine/notifications';
import Link from 'next/link';
import { Button } from '@mantine/core';
import { IconChevronsLeft } from '@tabler/icons-react';
import Image from 'next/image';
import useSound from 'use-sound';

const ScanUserBarcode = () => {
  const router = useRouter();
  const [scannedBarcode, setScanedBarcode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [playCashSound] = useSound("/cashpay.mp3", {
    interrupt: true
  });

  // バーコードをスキャンした時の処理
  const handleScanBarcode = async (barcode: string) => {
    if(isLoading) return
    setIsLoading(true)
    const scannedUser = await getUser(barcode);
    if(barcode.slice(0,3) != "108"){
      // ユーザのバーコードでない場合
      notifications.show({
        title: "異なる種類のバーコード",
        message: "梶研Pay以外のバーコードが読み取られました",
        color:"red",
        autoClose: 3000,
        style: (theme) => ({
          style: { backgroundColor: 'red' }
        })
      })
      setIsLoading(false)
      return
    }
    if(scannedUser.id != null){
      // 該当のユーザがヒットした時のみ残高払出しへ
      const status = await updateUserDebt(scannedUser.id, 0, "払い出し")
      notifications.show({
        title: "払い出す金額",
        message: scannedUser.name + "：" + (scannedUser.debt) + "円",
        color:"blue",
        autoClose: 5000,
        style: (theme) => ({
          style: { backgroundColor: 'blue' }
        })
      })
      playCashSound()
      setIsLoading(false)
      router.push("/")
      router.refresh()
    } else {
      console.log("ユーザいないよ")
      setIsLoading(false)
      // 該当のユーザが見つからなかった場合
      notifications.show({
        title: "存在しないユーザ",
        message: "未登録の梶研Payカードが読み取られました",
        color:"red",
        style: (theme) => ({
          style: { backgroundColor: 'red' }
        })
      })
    }
  }

  return (
    <div className=''>
      <Kajilabpay.ScanUserBarcode
        handleScanBarcode={handleScanBarcode}
        barcode={scannedBarcode}
        setBarcode={setScanedBarcode}
      />
      <div className="mt-2">
        <Link href={"/admin"}>
        <Button variant="light" color="gray" className="mt-5">
            <IconChevronsLeft/><div className="text-xl">キャンセル</div>
        </Button>
        </Link>
      </div>
      <div className="text-center items-center mt-5">
        <div className="text-6xl font-bold p-3 text-white bg-red-700 rounded-md">ここは残高払い出し画面です！</div>
        <div className="text-6xl font-bold p-3">梶研Payをスキャン</div>
        <Image
          className="mx-auto mt-10"
          src="/kjlbcard-scanmethod.jpg"
          width={300}
          height={200}
          alt="Picture of kajilabpay scan method"
        />
      </div>
      <Notifications className="text-2xl"/>
    </div>
  )
}

export default ScanUserBarcode