import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatEther } from "ethers"

interface NFTCardProps {
  id: string
  name: string
  image: string
  price: string
  creator: string
  tokenId: string
}

export default function NFTCard({ id, name, image, price, creator, tokenId }: NFTCardProps) {
  return (
    <Link href={`/nft/${tokenId}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            Creator: {creator.substring(0, 6)}...{creator.substring(38)}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <Badge variant="outline" className="font-semibold">
            {formatEther(price)} ETH
          </Badge>
          <Badge>#{tokenId}</Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}

export function NFTCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="aspect-square w-full" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-10" />
      </CardFooter>
    </Card>
  )
}
