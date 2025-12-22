import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { useState, useRef, useEffect } from 'react'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ProductVibeChart } from '../../components/dashboard/product-vibe-chart'
import { Loader2 } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { VotingPanel } from '../../components/dashboard/voting-panel'

export const Route = createFileRoute('/product/$name')({
  component: ProductPage,
})

function getRelativeTimeString(date: number | Date): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function ProductPage() {
    const { name } = Route.useParams()
    const navigate = useNavigate()
    const { toast } = useToast()
    const decodedName = decodeURIComponent(name)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const chartCardRef = useRef<HTMLDivElement>(null)
    
    // Queries
    const { data: product, isLoading } = useQuery(convexQuery(api.products.getByName, { name: decodedName }))

    const [productName, setProductName] = useState(decodedName)
    
    // Check for new product analysis data on mount
    useEffect(() => {
        if (!product && !isLoading) {
            const stored = sessionStorage.getItem('identifiedProduct')
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    // valid only if names match loosely
                    if (parsed.productName === decodedName || 'Unnamed Product' === decodedName) {
                        setAnalysisResult(parsed)
                        if (parsed.productName) setProductName(parsed.productName)
                    }
                } catch (e) {
                    console.error("Failed to parse analysis result")
                }
            }
        }
    }, [product, isLoading, decodedName])

    if (isLoading) return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin" /></div>

    // CASE 1: New Product Creation
    if (!product) {
        if (analysisResult || decodedName) { // Allow creation even if no analysis, just name
            return (
                <div className="container mx-auto p-4 max-w-2xl space-y-8">
                     <div className="flex flex-col items-center gap-4">
                        <Input 
                            value={productName} 
                            onChange={(e) => setProductName(e.target.value)} 
                            className="text-center text-3xl font-bold w-full max-w-md h-12"
                            placeholder="Product Name"
                        />
                        {/* Show "mock" badge or similar if needed, but user wants to edit title */}
                     </div>
                     <div className="flex justify-center">
                        {analysisResult?.imageUrl ? (
                             <img src={analysisResult.imageUrl} alt="New Product" className="max-h-[300px] rounded-lg shadow-lg" />
                        ) : (
                            <div className="text-muted-foreground p-8 border rounded">No Image Analyzed</div>
                        )}
                     </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>AI Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>Gluten Free?</strong> {analysisResult?.isLikelyGlutenFree ? 'Likely Yes' : (analysisResult?.isLikelyGlutenFree === false ? 'Unlikely' : 'Uncertain')}</p>
                            <p><strong>Risk Level:</strong> {analysisResult?.riskLevel || "Unknown"}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{analysisResult?.reasoning || "No analysis available."}</p>
                        </CardContent>
                     </Card>
                     
                     <VotingPanel 
                        product={null} 
                        productName={productName}
                        analysisResult={analysisResult}
                        onVibeSubmit={() => {
                            sessionStorage.removeItem('identifiedProduct');
                            // Navigate to the (potentially new) product name to load the "Refinement Page" (Existing View)
                            navigate({ to: `/product/${encodeURIComponent(productName)}` });
                            // Force reload if needed, but navigation should trigger query invalidation naturally or we can invalidate query
                            // window.location.href = ... might be safer if query invalidation is tricky
                        }}
                     />
                </div>
            )
        }
        return <div className="p-8 text-center">Product not found</div>
    }

    // CASE 2: Existing Product View
    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Community Vibe</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        {product.mainImage ? (
                            <img src={product.mainImage} alt={product.name} className="max-h-[400px] object-contain" />
                        ) : (
                            <div className="h-64 w-full bg-muted flex items-center justify-center text-muted-foreground">No Image</div>
                        )}
                    </CardContent>
                </Card>

                {/* Chart Card */}
                <Card ref={chartCardRef}>
                    <CardHeader>
                        <CardTitle>
                             Overall Vibe
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex justify-between text-center">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase">Safety</div>
                                <div className="text-2xl font-bold">{Math.round(product.avgSafety || 0)}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase">Taste</div>
                                <div className="text-2xl font-bold">{Math.round(product.avgTaste || 0)}%</div>
                            </div>
                             <div>
                                <div className="text-xs text-muted-foreground uppercase">Price</div>
                                <div className="text-2xl font-bold">${Math.round(product.avgPrice || 0)}</div>
                            </div>
                        </div>

                        <div className="relative h-[350px]">
                            <ProductVibeChart mode="vibe" />
                        </div>

                        <Tabs defaultValue="average" className="w-full">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="average">Average</TabsTrigger>
                                <TabsTrigger value="vote">Vote</TabsTrigger>
                            </TabsList>
                             <div className="mt-4">
                                <VotingPanel 
                                    product={{...product, id: product._id}}
                                    productName={product.name}
                                    analysisResult={null}
                                    onVibeSubmit={() => {
                                        toast({ title: "Vote Refreshed" })
                                    }}
                                />
                             </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            
             <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Ingredients</CardTitle></CardHeader>
                    <CardContent>
                        {product.ingredients?.length ? (
                            <ul className="list-disc pl-4">
                                {product.ingredients.map((i: any, idx: number) => <li key={idx}>{i}</li>)}
                            </ul>
                        ) : <div className="text-muted-foreground">No ingredients listed</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Stores</CardTitle></CardHeader>
                    <CardContent>
                         {product.stores?.length ? (
                            <div className="space-y-2">
                                {product.stores.map((store: any, idx: number) => (
                                    <div key={idx} className="flex justify-between p-2 border rounded">
                                        <span>{store.name}</span>
                                        <span>{getRelativeTimeString(store.lastSeenAt)}</span>
                                    </div>
                                ))}
                            </div>
                         ) : <div className="text-muted-foreground">No store data</div>}
                    </CardContent>
                </Card>
             </div>
        </div>
    )
}
