"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"

export default function ProfileRedirect() {
  const router = useRouter()
  const { address, isConnected } = useWallet()

  useEffect(() => {
    if (isConnected && address) {
      router.push(`/profile/${address}`)
    }
  }, [isConnected, address, router])

  return (
    <div className="container py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
      <p className="text-muted-foreground mb-6">Please connect your wallet to view your profile</p>
      <Button onClick={() => router.push("/")}>Back to Home</Button>
    </div>
  )
}
