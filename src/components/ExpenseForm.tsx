import { useState } from 'react'
import { supabase, type Expense } from '@/lib/supabase'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ExpenseFormProps {
  expense?: Expense | null
  onClose: () => void
  onSave: () => void
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Other'
]

export default function ExpenseForm({ expense, onClose, onSave }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    notes: expense?.notes || ''
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const expenseData = {
        title: formData.title,
        amount: parseFloat(formData.amount.toString()),
        category: formData.category,
        date: formData.date,
        notes: formData.notes || null,
        user_id: user.id
      }

      if (expense) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expense.id)

        if (error) throw error
        toast({
          title: "Success!",
          description: "Expense updated successfully.",
          variant: "default"
        })
      } else {
        // Create new expense
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData])

        if (error) throw error
        toast({
          title: "Success!",
          description: "Expense added successfully.",
          variant: "default"
        })
      }

      onSave()
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button onClick={onClose} variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
          <CardHeader>
            <CardTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
            <CardDescription>
              {expense ? 'Update your expense details' : 'Enter the details of your expense'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Lunch at restaurant"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this expense..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="financial" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  <Save className="h-4 w-4 mr-2" />
                  {expense ? 'Update Expense' : 'Save Expense'}
                </Button>
                <Button type="button" onClick={onClose} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}