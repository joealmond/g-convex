import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ProductVibeChart } from '../../components/dashboard/product-vibe-chart'
import { DraggableDot } from '../../components/dashboard/draggable-dot'
import { Loader2, CheckCircle, ThumbsUp } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { VotingPanel } from '../../components/dashboard/voting-panel'
import { Button } from '../../components/ui/button'
import { Slider } from '../../components/ui/slider'
import { Label } from '../../components/ui/label'
import { useMutation } from 'convex/react'
import { useCurrentUser } from '../../hooks/use-current-user'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/product/$name')({
  component: ProductPage,
  validateSearch: (search: Record<string, unknown>) => ({
    voted: search.voted as string | undefined,
  }),
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
    
    // Check if this is a "new product" creation URL (new-{timestamp})
    const isNewProductUrl = decodedName.startsWith('new-')
    
    // Query for existing product - for new product URLs this will return null which is fine
    const { data: product, isLoading } = useQuery(
        convexQuery(api.products.getByName, { name: decodedName })
    )

    const [productName, setProductName] = useState(isNewProductUrl ? 'New Product' : decodedName)
    
    // Check if user just voted (came from VotingPanel)
    const search = Route.useSearch() as { voted?: string }
    
    // View mode: average, myVote, allVotes - default to myVote if just voted
    const [viewMode, setViewMode] = useState<'average' | 'myVote' | 'allVotes'>(
        search?.voted === 'true' ? 'myVote' : 'average'
    )
    
    // Fine-tuning state
    const [customVibe, setCustomVibe] = useState({ safety: 50, taste: 50 })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    
    const { userId } = useCurrentUser()
    const castVoteMutation = useMutation(api.votes.castVote)
    
    // Load analysis data from sessionStorage for new product URLs
    useEffect(() => {
        if (isNewProductUrl || (!product && !isLoading)) {
            const stored = sessionStorage.getItem('identifiedProduct')
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    setAnalysisResult(parsed)
                    if (parsed.productName) {
                        setProductName(parsed.productName)
                    }
                } catch (e) {
                    console.error("Failed to parse analysis result")
                }
            }
        }
    }, [product, isLoading, decodedName])
    
    // Initialize customVibe from product averages
    useEffect(() => {
        if (product) {
            setCustomVibe({
                safety: product.avgSafety || 50,
                taste: product.avgTaste || 50
            })
        }
    }, [product])
    
    const handleVibeChange = useCallback((newVibe: { safety: number; taste: number }) => {
        setCustomVibe(newVibe)
    }, [])
    
    const handleSliderChange = (type: 'safety' | 'taste', value: number[]) => {
        setCustomVibe(prev => ({ ...prev, [type]: value[0] }))
    }
    
    // Submit fine-tuned vote
    const handleSubmitFineTune = async () => {
        if (!product || !userId) return
        setIsSubmitting(true)
        
        try {
            await castVoteMutation({
                productId: product._id as Id<"products">,
                safety: customVibe.safety,
                taste: customVibe.taste,
                userId,
            })
            
            toast({
                title: hasVoted ? "Vote Updated!" : "Vote Saved!",
                description: "Your fine-tuned rating has been recorded."
            })
            setHasVoted(true)
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: e.message || 'Failed to save vote'
            })
        } finally {
            setIsSubmitting(false)
        }
    }
    
    // Agree with community average
    const handleAgree = async () => {
        if (!product || !userId) return
        setIsSubmitting(true)
        
        try {
            await castVoteMutation({
                productId: product._id as Id<"products">,
                safety: Math.round(product.avgSafety || 50),
                taste: Math.round(product.avgTaste || 50),
                userId,
            })
            
            toast({
                title: "Agreed!",
                description: "You agreed with the community average."
            })
            setHasVoted(true)
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: e.message || 'Failed to save vote'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Don't show loading for new product URLs since we're not querying
    if (isLoading && !isNewProductUrl) return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin" /></div>

    // CASE 1: New Product Creation (new-* URL or no existing product found)
    if (isNewProductUrl || !product) {
        if (analysisResult || productName) {
            return (
                <div className="container mx-auto p-4 max-w-2xl space-y-8">
                     <div className="flex flex-col items-center gap-4">
                        <Input 
                            value={productName} 
                            onChange={(e) => setProductName(e.target.value)} 
                            className="text-center text-3xl font-bold w-full max-w-md h-12"
                            placeholder="Product Name"
                        />
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
                            // Navigate to product page with voted=true to auto-show My Vote tab
                            navigate({ to: `/product/${encodeURIComponent(productName)}`, search: { voted: 'true' } });
                        }}
                     />
                </div>
            )
        }
        return <div className="p-8 text-center">Product not found</div>
    }

    // CASE 2: Existing Product View - with inline fine-tuning like original
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

                {/* Chart Card with Inline Fine-Tuning */}
                <Card ref={chartCardRef}>
                    <CardHeader>
                        <CardTitle>Overall Vibe</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         {/* Stats Row */}
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
                                <div className="text-xs text-muted-foreground uppercase">Votes</div>
                                <div className="text-2xl font-bold">{product.voteCount || 0}</div>
                            </div>
                        </div>

                        {/* Chart with Draggable Dot */}
                        <div className="relative h-[350px]">
                            <ProductVibeChart mode="vibe" />
                            
                            {/* Average dot when in average view */}
                            {viewMode === 'average' && (
                                <div
                                    className="absolute w-4 h-4 rounded-full border-2 border-primary-foreground shadow-lg pointer-events-none bg-primary"
                                    style={{
                                        left: `calc(${product.avgTaste || 50}% - 8px)`,
                                        top: `calc(${100 - (product.avgSafety || 50)}% - 8px)`,
                                    }}
                                />
                            )}
                            
                            {/* Draggable dot when in myVote view */}
                            {viewMode === 'myVote' && (
                                <DraggableDot
                                    safety={customVibe.safety}
                                    taste={customVibe.taste}
                                    onVibeChange={handleVibeChange}
                                />
                            )}
                        </div>
                        
                        {/* View Mode Tabs */}
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="average">Average</TabsTrigger>
                                <TabsTrigger value="myVote">My Vote</TabsTrigger>
                                <TabsTrigger value="allVotes">All Votes</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        
                        {/* Fine-Tuning Controls - show when in myVote mode */}
                        {viewMode === 'myVote' && (
                            <div className="space-y-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Drag the dot or use sliders to fine-tune your vote
                                </p>
                                
                                {/* Sliders */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Safety: {customVibe.safety}%</Label>
                                        <Slider
                                            value={[customVibe.safety]}
                                            onValueChange={(v) => handleSliderChange('safety', v)}
                                            max={100}
                                            step={1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">Taste: {customVibe.taste}%</Label>
                                        <Slider
                                            value={[customVibe.taste]}
                                            onValueChange={(v) => handleSliderChange('taste', v)}
                                            max={100}
                                            step={1}
                                        />
                                    </div>
                                </div>
                                
                                {/* Vote Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        onClick={handleAgree}
                                        disabled={isSubmitting}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                                        Agree with Community
                                    </Button>
                                    <Button
                                        onClick={handleSubmitFineTune}
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        {hasVoted ? "Update Vote" : "Submit Vote"}
                                    </Button>
                                </div>
                            </div>
                        )}
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
