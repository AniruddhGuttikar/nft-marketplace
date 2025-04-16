"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/wallet-context";
import { uploadNFTImage, createNFT, createMarketplaceItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { parseEther } from "ethers";
import { Upload, ImageIcon } from "lucide-react";

export default function CreateNFT() {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create an NFT",
      });
      return;
    }

    if (!name || !description || !price || !image) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all fields and upload an image",
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Upload image to IPFS
      console.log("uploadNFTImage: ", image.name);

      const imageData = await uploadNFTImage(image);
      const imageUrl = imageData.url;

      // 2. Create NFT metadata
      const nftData = {
        name,
        description,
        image: imageUrl,
        creatorAddress: address,
        // attributes: [], // Add actual attributes if needed
        // royaltyPercentage: 250, // Optional, defaults to 250 = 2.5%
      };

      // 3. Create NFT
      const nft = await createNFT(nftData);
      const tokenURI = nft.tokenURI;

      // 4. List NFT on marketplace
      const marketplaceData = {
        tokenId: nft.tokenId,
        price: parseEther(price).toString(),
        seller: address,
      };

      await createMarketplaceItem(marketplaceData);

      toast({
        title: "NFT Created Successfully",
        description: "Your NFT has been created and listed on the marketplace",
      });

      // Redirect to the NFT page
      router.push(`/nft/${nft.tokenId}`);
    } catch (error) {
      console.error("Failed to create NFT:", error);
      toast({
        variant: "destructive",
        title: "Failed to Create NFT",
        description: "There was an error creating your NFT. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              You need to connect your wallet to create an NFT
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/")}
            >
              Go to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New NFT</h1>

        <Card>
          <CardHeader>
            <CardTitle>NFT Details</CardTitle>
            <CardDescription>
              Fill in the details for your new NFT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image">NFT Image</Label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  {imagePreview ? (
                    <div className="relative w-full aspect-square max-w-xs">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="NFT Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <p className="text-sm font-medium">
                        Click to upload image
                      </p>
                      <p className="text-xs">PNG, JPG or GIF (Max 10MB)</p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="NFT Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your NFT..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (ETH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.05"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4 animate-spin" />
                    Creating NFT...
                  </span>
                ) : (
                  "Create NFT"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
