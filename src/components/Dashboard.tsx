import { useState, useEffect } from 'react'
import { supabase, type Expense } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/enhanced-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, TrendingDown, Calendar, DollarSign, PieChart as PieChartIcon, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import ExpenseForm from './ExpenseForm'
import ExpenseCard from './ExpenseCard'

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('month')
  const { toast } = useToast()

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const getFilteredExpenses = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      
      switch (timeFilter) {
        case 'today':
          return expenseDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return expenseDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return expenseDate >= monthAgo
        default:
          return true
      }
    })
  }

  const filteredExpenses = getFilteredExpenses()
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Category breakdown
  const categoryData = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount
  }))

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--expense))', 'hsl(var(--accent))']

  if (showForm || editingExpense) {
    return (
      <ExpenseForm
        expense={editingExpense}
        onClose={() => {
          setShowForm(false)
          setEditingExpense(null)
        }}
        onSave={() => {
          fetchExpenses()
          setShowForm(false)
          setEditingExpense(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary to-primary-light rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ExpenseTracker</h1>
                <p className="text-sm text-muted-foreground">Manage your finances</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowForm(true)} variant="financial">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Filter */}
        <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as any)} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredExpenses.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per Day</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${(totalAmount / (timeFilter === 'today' ? 1 : timeFilter === 'week' ? 7 : 30)).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {timeFilter} data
              </p>
            </CardContent>
          </Card>

          <Card className="border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <PieChartIcon className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{Object.keys(categoryData).length}</div>
              <p className="text-xs text-muted-foreground">
                Different categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Chart */}
          <Card className="border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Breakdown of your spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card className="border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
              {filteredExpenses.slice(0, 6).map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={() => setEditingExpense(expense)}
                  onDelete={() => fetchExpenses()}
                />
              ))}
              {filteredExpenses.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No expenses found for this period</p>
                  <Button onClick={() => setShowForm(true)} variant="outline" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first expense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}