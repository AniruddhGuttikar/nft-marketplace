"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { getNFTByTokenId, getMarketplaceItemById } from "@/lib/api"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import { Heart, Share2, ExternalLink } from "lucide-react"

interface NFTDetails {
  tokenId: string
  name: string
  description: string
  image: string
  creator: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

interface MarketplaceItem {
  id: string
  tokenId: string
  price: string
  seller: string
}

export default function NFTDetails() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { address, isConnected } = useWallet()
  const tokenId = params.tokenId as string

  const [nft, setNft] = useState<NFTDetails | null>(null)
  const [marketItem, setMarketItem] = useState<MarketplaceItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [buyLoading, setBuyLoading] = useState(false)

  useEffect(() => {
    const fetchNFTDetails = async () => {
      try {
        setLoading(true)
        const nftData = await getNFTByTokenId(tokenId)
        setNft(nftData)

        // Get marketplace item details
        const marketItemData = await getMarketplaceItemById(tokenId)
        setMarketItem(marketItemData)
      } catch (error) {
        console.error("Failed to fetch NFT details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load NFT details",
        })
      } finally {
        setLoading(false)
      }
    }

    if (tokenId) {
      fetchNFTDetails()
    }
  }, [tokenId, toast])

  const handleBuyNFT = async () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to buy this NFT",
      })
      return
    }

    if (!marketItem) return

    try {
      setBuyLoading(true)

      // In a real implementation, this would interact with the blockchain
      // For this demo, we'll simulate a successful purchase

      toast({
        title: "Purchase Successful",
        description: "You have successfully purchased this NFT!",
      })

      // Redirect to profile page
      router.push(`/profile/${address}`)
    } catch (error) {
      console.error("Failed to buy NFT:", error)
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "Failed to complete the purchase. Please try again.",
      })
    } finally {
      setBuyLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!nft) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">NFT Not Found</h1>
        <p className="text-muted-foreground mb-6">The NFT you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    )
  }

  const isOwner = marketItem?.seller.toLowerCase() === address?.toLowerCase()

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* NFT Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden border">
          <Image
            src={nft.image || "/placeholder.svg"}
            alt={nft.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* NFT Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{nft.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Token ID: {nft.tokenId}</Badge>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Creator</p>
            <p className="font-medium">
              {nft.creator.substring(0, 6)}...{nft.creator.substring(38)}
            </p>
          </div>

          {marketItem && (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-2xl font-bold">{ethers.formatEther(marketItem.price)} ETH</p>
                  </div>

                  {isOwner ? (
                    <Button variant="outline" disabled>
                      You Own This NFT
                    </Button>
                  ) : (
                    <Button onClick={handleBuyNFT} disabled={buyLoading || !isConnected}>
                      {buyLoading ? "Processing..." : "Buy Now"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-muted-foreground mt-1">{nft.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Blockchain</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-muted-foreground">Ethereum</p>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="attributes" className="pt-4">
              {nft.attributes && nft.attributes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {nft.attributes.map((attr, index) => (
                    <div key={index} className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{attr.trait_type}</p>
                      <p className="font-medium truncate">{attr.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No attributes found for this NFT.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
