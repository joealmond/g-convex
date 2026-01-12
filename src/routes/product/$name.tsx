import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { CoordinateGrid } from '../../components/dashboard/coordinate-grid'
import { Loader2, CheckCircle, ThumbsUp, Users, ShieldCheck, Eye, Trash2 } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { VotingPanel } from '../../components/dashboard/voting-panel'
import { Button } from '../../components/ui/button'
import { Slider } from '../../components/ui/slider'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { ScrollArea } from '../../components/ui/scroll-area'
import { useMutation } from 'convex/react'
import { useCurrentUser } from '../../hooks/use-current-user'
import { useAdmin } from '../../hooks/use-admin'
import { useImpersonate } from '../../hooks/use-impersonate'
import type { Id } from '../../../convex/_generated/dataModel'
import { useTranslations } from '../../lib/i18n'

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
    // Translations
    const t = useTranslations('ProductPage')
    
    const { name } = Route.useParams()
    const navigate = useNavigate()
    const { toast } = useToast()
    const decodedName = decodeURIComponent(name)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const chartCardRef = useRef<HTMLDivElement>(null)
    
    // Admin and impersonation
    const { isAdmin, isRealAdmin } = useAdmin()
    const { impersonatedUserId, startViewingAsUser } = useImpersonate()
    const [highlightedVoteId, setHighlightedVoteId] = useState<string | null>(null)
    const [deletingVoteId, setDeletingVoteId] = useState<string | null>(null)
    
    // Check if this is a "new product" creation URL (new-{timestamp})
    const isNewProductUrl = decodedName.startsWith('new-')
    
    // Query for existing product - for new product URLs this will return null which is fine
    const { data: product, isLoading } = useQuery(
        convexQuery(api.products.getByName, { name: decodedName })
    )
    
    // Query for all votes (for admin voter list) - only when product exists
    // Note: query is skipped if productId is undefined
    const { data: allVotes } = useQuery(
        convexQuery(api.votes.byProduct, product?._id ? { productId: product._id } : "skip")
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
    
    const { userId, isRegistered } = useCurrentUser()
    const castVoteMutation = useMutation(api.votes.castVote)
    const deleteVoteMutation = useMutation(api.votes.deleteVote)
    
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
    
    // Delete vote handler (admin only)
    const handleDeleteVote = async (voteUserId: string) => {
        if (!product || !isAdmin) return
        setDeletingVoteId(voteUserId)
        try {
            await deleteVoteMutation({
                productId: product._id as Id<"products">,
                voteUserId,
            })
            toast({
                title: t('voteDeleted'),
                description: t('voteDeletedDescription'),
            })
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('deleteVoteFailed'),
                description: error.message,
            })
        } finally {
            setDeletingVoteId(null)
        }
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
                                <div className="text-xs text-muted-foreground uppercase">{t('safety')}</div>
                                <div className="text-2xl font-bold">{Math.round(product.avgSafety || 0)}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase">{t('taste')}</div>
                                <div className="text-2xl font-bold">{Math.round(product.avgTaste || 0)}%</div>
                            </div>
                             <div>
                                <div className="text-xs text-muted-foreground uppercase">{t('votes')}</div>
                                <div className="text-2xl font-bold">{product.voteCount || 0}</div>
                            </div>
                        </div>
                        
                        {/* Weighted average indicator */}
                        <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                            <span>{t('registeredVotesWeight')}</span>
                        </div>

                        {/* Chart with CoordinateGrid - unified dot positioning */}
                        <div className="py-4">
                            <CoordinateGrid
                                mode="vibe"
                                showLabels={true}
                                showAxisLabels={true}
                                dots={(() => {
                                    // When impersonating, find that user's vote
                                    const impersonatedVote = impersonatedUserId && allVotes 
                                        ? allVotes.find((v: any) => v.userId === impersonatedUserId)
                                        : null;
                                    
                                    if (viewMode === 'average') {
                                        return [{
                                            x: product.avgTaste ?? 50,
                                            y: product.avgSafety ?? 50,
                                            color: 'hsl(var(--primary))',
                                            size: 'lg' as const,
                                            id: 'average'
                                        }];
                                    }
                                    
                                    if (viewMode === 'myVote') {
                                        // If impersonating, show that user's vote (read-only)
                                        if (impersonatedVote) {
                                            return [{
                                                x: impersonatedVote.taste,
                                                y: impersonatedVote.safety,
                                                color: 'hsl(45 93% 47%)', // Gold for impersonated
                                                size: 'lg' as const,
                                                id: 'impersonated'
                                            }];
                                        }
                                        return []; // Draggable will handle this
                                    }
                                    
                                    if (viewMode === 'allVotes' && allVotes) {
                                        return [
                                            // Show average dot
                                            {
                                                x: product.avgTaste ?? 50,
                                                y: product.avgSafety ?? 50,
                                                color: 'hsl(var(--primary))',
                                                size: 'lg' as const,
                                                id: 'average'
                                            },
                                            // Show all individual vote dots
                                            ...allVotes.map((vote: any, idx: number) => ({
                                                x: vote.taste,
                                                y: vote.safety,
                                                color: vote.userId === impersonatedUserId 
                                                    ? 'hsl(45 93% 47%)' // Gold for impersonated
                                                    : vote.isRegistered 
                                                        ? 'hsl(142 76% 36%)' // Green for registered
                                                        : 'hsl(var(--muted-foreground))', // Gray for anonymous
                                                size: (vote.userId === impersonatedUserId ? 'lg' : 'sm') as 'lg' | 'sm',
                                                id: `vote-${idx}`
                                            }))
                                        ];
                                    }
                                    
                                    return [];
                                })()}
                                draggable={viewMode === 'myVote' && !impersonatedUserId ? {
                                    x: Math.round(customVibe.taste),
                                    y: Math.round(customVibe.safety),
                                    onChange: (x, y) => handleVibeChange({ safety: Math.round(y), taste: Math.round(x) })
                                } : undefined}
                            />
                        </div>
                        
                        {/* Impersonation indicator */}
                        {impersonatedUserId && (
                            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-yellow-500 text-sm">
                                <Eye className="h-4 w-4" />
                                <span>Viewing as: {impersonatedUserId.slice(0, 12)}...</span>
                            </div>
                        )}
                        
                        {/* View Mode Tabs */}
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="average">{t('average')}</TabsTrigger>
                                <TabsTrigger value="myVote">{impersonatedUserId ? t('theirVote') : t('myVote')}</TabsTrigger>
                                <TabsTrigger value="allVotes">{t('allVotes')}</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        
                        {/* Fine-Tuning Controls - show when in myVote mode AND logged in */}
                        {viewMode === 'myVote' && isRegistered && (
                            <div className="space-y-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    {t('dragToVote')}
                                </p>
                                
                                {/* Sliders */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Safety: {Math.round(customVibe.safety)}%</Label>
                                        <Slider
                                            value={[customVibe.safety]}
                                            onValueChange={(v) => handleSliderChange('safety', v)}
                                            max={100}
                                            step={1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">Taste: {Math.round(customVibe.taste)}%</Label>
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
                                        disabled={isSubmitting || !isRegistered}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                                        {t('agreeWithCommunity')}
                                    </Button>
                                    <Button
                                        onClick={handleSubmitFineTune}
                                        disabled={isSubmitting || !isRegistered}
                                        className="flex-1"
                                    >
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        {hasVoted ? t('confirmUpdate') : t('confirmVote')}
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {/* Sign-in prompt - show when in myVote mode but NOT logged in */}
                        {viewMode === 'myVote' && !isRegistered && (
                            <div className="py-8 text-center space-y-4 border-t">
                                <p className="text-muted-foreground">
                                    {t('signInToVote')}
                                </p>
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
             
             {/* Admin Voter List */}
             {isRealAdmin && allVotes && allVotes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {t('voterList')}
                        </CardTitle>
                        <CardDescription>
                            {t('voterListDescription', { count: allVotes.length })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                                {allVotes.map((vote: any) => {
                                    const voteAge = vote.timestamp ? getRelativeTimeString(vote.timestamp) : null
                                    const isImpersonating = impersonatedUserId === vote.userId
                                    
                                    return (
                                        <div 
                                            key={vote._id}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                                                highlightedVoteId === vote.userId ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                            } ${isImpersonating ? 'ring-2 ring-yellow-500' : ''}`}
                                            onClick={() => {
                                                setHighlightedVoteId(prev => prev === vote.userId ? null : vote.userId)
                                                setViewMode('allVotes')
                                                setTimeout(() => {
                                                    chartCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                                }, 100)
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {vote.userId?.slice(0, 8)}...
                                                        </span>
                                                        {vote.isRegistered ? (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <ShieldCheck className="h-3 w-3 mr-1" />
                                                                {t('verified')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs">{t('anonymous')}</Badge>
                                                        )}
                                                        {voteAge && (
                                                            <span className="text-xs text-muted-foreground">{voteAge}</span>
                                                        )}
                                                        {isImpersonating && (
                                                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                {t('impersonating')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-4 text-sm mt-1">
                                                        <span>{t('safety')}: <strong>{vote.safety}%</strong></span>
                                                        <span>{t('taste')}: <strong>{vote.taste}%</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`hover:bg-yellow-500/10 ${isImpersonating ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        startViewingAsUser(vote.userId)
                                                    }}
                                                    title={t('viewAsThisUser')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteVote(vote.userId)
                                                    }}
                                                    disabled={deletingVoteId === vote.userId}
                                                >
                                                    {deletingVoteId === vote.userId ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
             )}
        </div>
    )
}

