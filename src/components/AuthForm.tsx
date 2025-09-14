import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Wallet } from 'lucide-react'

export default function AuthForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAuth = async (type: 'signup' | 'signin', formData: FormData) => {
    setLoading(true)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast({
          title: "Success!",
          description: "Check your email for the confirmation link.",
          variant: "default"
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          variant: "default"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 bg-gradient-to-r from-primary to-primary-light rounded-full w-fit">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">ExpenseTracker</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your finances with ease
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleAuth('signin', formData)
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input 
                    id="signin-email" 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input 
                    id="signin-password" 
                    name="password" 
                    type="password" 
                    placeholder="Enter your password"
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="financial" 
                  size="lg" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleAuth('signup', formData)
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    name="password" 
                    type="password" 
                    placeholder="Create a password"
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="financial" 
                  size="lg" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}