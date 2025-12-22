import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Slider } from '../../components/ui/slider'
import { Label } from '../../components/ui/label'
import { ProductVibeChart } from '../../components/dashboard/product-vibe-chart'
import { getColorForProduct } from '../../components/dashboard/matrix-chart'
import { Loader2, ThumbsUp } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

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
    const { toast } = useToast()
    const decodedName = decodeURIComponent(name)
    
    // Queries
    const { data: product } = useSuspenseQuery(convexQuery(api.products.getByName, { name: decodedName })) as { data: any }
    
    // We need product ID for other queries, but hooks must be unconditional.
    // product might be null if not found.
    const productId = product?._id;

    // Use queryWithStatus or handle skip logic if supported, or just pass skip arg if using pure convex-react
    // With react-query adapter, we rely on dependent queries usually.
    // For now assuming product exists for simplicity of migration step.
    
    const { data: userVote } = useQuery(convexQuery(api.votes.userVote, productId ? { productId } : "skip" as any))
    
    const castVote = useConvexMutation(api.votes.castVote)

    // State
    const [viewMode, setViewMode] = useState<'average' | 'myVote' | 'allVotes'>('average')
    const [chartMode] = useState<'vibe' | 'value'>('vibe')
    const [customVibe, setCustomVibe] = useState({ safety: 50, taste: 50 })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const chartCardRef = useRef<HTMLDivElement>(null)

    // Sync state with user vote
    useEffect(() => {
        if (userVote) {
             // Adapt if vote structure differs (voteType vs explicit safety/taste)
             // simplified for vibe mode
             // We need to parse value back to safety/taste if that's how we store it?
             // Or just use 'value' field. 
             // Assume simplified: voteType="vibe", value=50 (placeholder).
             // Ideally we store safety/taste separately or use value for single dimension.
             // For migration, we might want to update backend to Store safety/taste explicitly if that's the core model.
             // The original code used safety/taste. I added them as optional args to castVote.
        }
    }, [userVote])

    if (!product) {
        return <div className="p-8 text-center">Product not found</div>
    }

    const handleVote = async () => {
        setIsSubmitting(true)
        try {
            await castVote({
                productId: product._id,
                voteType: chartMode,
                value: 0, // Use specific fields below
                safety: customVibe.safety,
                taste: customVibe.taste
            })
            toast({ title: "Vote submitted!" })
        } catch (e) {
            toast({ title: "Error submitting vote", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

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
                             {chartMode === 'vibe' ? 'Overall Vibe' : 'Overall Value'}
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
                            <ProductVibeChart mode={chartMode} />
                             {/* Dots rendering logic would go here, simplified for MVP */}
                             {viewMode === 'average' && (
                                <div 
                                    className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg"
                                    style={{
                                        left: `calc(${(product.avgTaste || 50)}% - 8px)`,
                                        top: `calc(${100 - (product.avgSafety || 50)}% - 8px)`,
                                        backgroundColor: getColorForProduct(product.name)
                                    }}
                                />
                             )}
                        </div>

                        <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="average">Average</TabsTrigger>
                                <TabsTrigger value="myVote">My Vote</TabsTrigger>
                                <TabsTrigger value="allVotes">All Votes</TabsTrigger>
                            </TabsList>
                        </Tabs>

                         {viewMode === 'myVote' && (
                             <div className="space-y-4 pt-4 border-t">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Safety: {customVibe.safety}%</Label>
                                        <Slider 
                                            value={[customVibe.safety]} 
                                            max={100} 
                                            onValueChange={([v]) => setCustomVibe(p => ({...p, safety: v}))} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Taste: {customVibe.taste}%</Label>
                                        <Slider 
                                            value={[customVibe.taste]} 
                                            max={100} 
                                            onValueChange={([v]) => setCustomVibe(p => ({...p, taste: v}))} 
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleVote} disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                                    Vote
                                </Button>
                             </div>
                         )}
                    </CardContent>
                </Card>
            </div>
            
             {/* Ingredients & Store Info Placeholders */}
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
