import React from 'react'
import * as PayoutComponents from "@/app/features/payout/components/Index"

const PayoutPage = ({params}: {params: {userBarcode: string}}) => {
  return (
    <PayoutComponents.ScanUserBarcode/>
)
}

export default PayoutPage