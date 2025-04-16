"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useWallet } from "@/context/wallet-context"
import { getUserProfile, getUserNFTs, getUserCreatedNFTs } from "@/lib/api"
import NFTCard, { NFTCardSkeleton } from "@/components/nft-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy, Check, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UserProfile {
  address: string
  username?: string
  bio?: string
  avatar?: string
}

interface NFTItem {
  id: string
  tokenId: string
  name: string
  description: string
  image: string
  price: string
  seller: string
  creator: string
}

export default function ProfilePage() {
  const params = useParams()
  const { address: walletAddress, isConnected } = useWallet()
  const { toast } = useToast()
  const address = params.address as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [ownedNFTs, setOwnedNFTs] = useState<NFTItem[]>([])
  const [createdNFTs, setCreatedNFTs] = useState<NFTItem[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const isOwner = address.toLowerCase() === walletAddress?.toLowerCase()

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)

        // Fetch user profile
        const profileData = await getUserProfile(address)
        setProfile(profileData)

        // Fetch owned NFTs
        const ownedNFTsData = await getUserNFTs(address)
        setOwnedNFTs(ownedNFTsData)

        // Fetch created NFTs
        const createdNFTsData = await getUserCreatedNFTs(address)
        setCreatedNFTs(createdNFTsData)
      } catch (error) {
        console.error("Failed to fetch profile data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        })
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchProfileData()
    }
  }, [address, toast])

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Address Copied",
      description: "Address copied to clipboard",
    })
  }

  if (!isConnected) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-muted-foreground mb-6">Please connect your wallet to view your profile</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile?.avatar || "/placeholder.svg?height=96&width=96"} alt="Profile" />
            <AvatarFallback>{address.substring(2, 4).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile?.username || `User ${address.substring(0, 6)}`}</h1>

            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <p className="text-muted-foreground">
                {address.substring(0, 6)}...{address.substring(38)}
              </p>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyAddressToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {profile?.bio && <p className="mt-4 text-muted-foreground max-w-2xl">{profile.bio}</p>}
          </div>

          {isOwner && <Button variant="outline">Edit Profile</Button>}
        </div>

        {/* NFT Tabs */}
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="owned">Owned NFTs</TabsTrigger>
            <TabsTrigger value="created">Created NFTs</TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="pt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <NFTCardSkeleton key={index} />
                  ))}
              </div>
            ) : ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ownedNFTs.map((nft) => (
                  <NFTCard
                    key={nft.id}
                    id={nft.id}
                    name={nft.name}
                    image={nft.image}
                    price={nft.price}
                    creator={nft.creator}
                    tokenId={nft.tokenId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold">No NFTs Found</h3>
                <p className="text-muted-foreground mt-2">This wallet doesn't own any NFTs yet</p>
                <Button className="mt-4" onClick={() => (window.location.href = "/")}>
                  Browse Marketplace
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="created" className="pt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <NFTCardSkeleton key={index} />
                  ))}
              </div>
            ) : createdNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {createdNFTs.map((nft) => (
                  <NFTCard
                    key={nft.id}
                    id={nft.id}
                    name={nft.name}
                    image={nft.image}
                    price={nft.price}
                    creator={nft.creator}
                    tokenId={nft.tokenId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold">No Created NFTs</h3>
                <p className="text-muted-foreground mt-2">This wallet hasn't created any NFTs yet</p>
                <Button className="mt-4" onClick={() => (window.location.href = "/create")}>
                  Create NFT
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
