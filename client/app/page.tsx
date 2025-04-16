"use client"

import { useEffect, useState } from "react"
import { getAllMarketplaceItems } from "@/lib/api"
import NFTCard, { NFTCardSkeleton } from "@/components/nft-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

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

export default function Home() {
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFTItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const data = await getAllMarketplaceItems()
        setNfts(data)
        setFilteredNfts(data)
      } catch (error) {
        console.error("Failed to fetch NFTs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [])

  useEffect(() => {
    // Filter NFTs based on search term
    const filtered = nfts.filter(
      (nft) =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort NFTs based on selected option
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "price-low") {
        return Number.parseFloat(a.price) - Number.parseFloat(b.price)
      } else if (sortBy === "price-high") {
        return Number.parseFloat(b.price) - Number.parseFloat(a.price)
      }
      // Default: recent (by id, assuming higher id means more recent)
      return Number.parseInt(b.id) - Number.parseInt(a.id)
    })

    setFilteredNfts(sorted)
  }, [searchTerm, sortBy, nfts])

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Discover NFTs</h1>
        <p className="text-muted-foreground">Explore and collect unique digital assets on our marketplace</p>

        <div className="flex flex-col sm:flex-row gap-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search NFTs by name or description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <NFTCardSkeleton key={index} />
              ))}
          </div>
        ) : filteredNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredNfts.map((nft) => (
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
            <p className="text-muted-foreground mt-2">
              {searchTerm ? "Try a different search term" : "There are no NFTs listed yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
