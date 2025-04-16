"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  balance: string
  chainId: number | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  balance: "0",
  chainId: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState("0")
  const [chainId, setChainId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()

          if (accounts.length > 0) {
            const account = accounts[0]
            const address = account.address
            const network = await provider.getNetwork()
            const balance = await provider.getBalance(address)

            setAddress(address)
            setIsConnected(true)
            setBalance(ethers.formatEther(balance))
            setChainId(Number(network.chainId))
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error)
        }
      }
    }

    checkConnection()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet()
        } else {
          setAddress(accounts[0])
          setIsConnected(true)
          updateBalance(accounts[0])
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const updateBalance = async (address: string) => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(address)
        setBalance(ethers.formatEther(balance))
      } catch (error) {
        console.error("Failed to get balance:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        const address = accounts[0]
        const network = await provider.getNetwork()
        const balance = await provider.getBalance(address)

        setAddress(address)
        setIsConnected(true)
        setBalance(ethers.formatEther(balance))
        setChainId(Number(network.chainId))

        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(38)}`,
        })
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to connect to MetaMask. Please try again.",
        })
      }
    } else {
      toast({
        variant: "destructive",
        title: "MetaMask Not Found",
        description: "Please install MetaMask extension to connect your wallet.",
      })
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    setBalance("0")
    setChainId(null)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        balance,
        chainId,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
