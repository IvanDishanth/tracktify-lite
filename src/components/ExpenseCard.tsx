import { useState } from 'react'
import { supabase, type Expense } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit2, Trash2, Calendar, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ExpenseCardProps {
  expense: Expense
  onEdit: () => void
  onDelete: () => void
}

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-orange-100 text-orange-800 border-orange-200',
  'Transportation': 'bg-blue-100 text-blue-800 border-blue-200',
  'Shopping': 'bg-purple-100 text-purple-800 border-purple-200',
  'Entertainment': 'bg-pink-100 text-pink-800 border-pink-200',
  'Bills & Utilities': 'bg-red-100 text-red-800 border-red-200',
  'Healthcare': 'bg-green-100 text-green-800 border-green-200',
  'Travel': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Education': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Other': 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)

      if (error) throw error
      
      toast({
        title: "Success!",
        description: "Expense deleted successfully.",
        variant: "default"
      })
      onDelete()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="border border-border hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">{expense.title}</h3>
              <Badge className={`text-xs ${categoryColors[expense.category] || categoryColors['Other']}`}>
                {expense.category}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(expense.date)}
              </div>
              {expense.notes && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{expense.notes}</span>
                </div>
              )}
            </div>
            
            <div className="text-lg font-bold text-expense">
              -${expense.amount.toFixed(2)}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button onClick={onEdit} variant="ghost" size="icon" className="h-8 w-8">
              <Edit2 className="h-3 w-3" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{expense.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}