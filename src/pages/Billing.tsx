import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  CreditCard,
  Receipt,
  Download,
  Plus,
  Check,
  Zap,
  Crown,
  ArrowUpRight,
} from "lucide-react";

const Billing = () => {
  const [currentPlan] = useState("pro");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individuals and small teams",
      features: [
        "50 AI-generated ads/month",
        "5 campaigns",
        "Basic analytics",
        "Email support",
      ],
      icon: <Zap className="h-5 w-5" />,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$79",
      period: "/month",
      description: "Best for growing businesses",
      features: [
        "Unlimited AI-generated ads",
        "Unlimited campaigns",
        "Advanced analytics",
        "Priority support",
        "Custom brand kits",
        "API access",
      ],
      icon: <Crown className="h-5 w-5" />,
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "White-label options",
        "On-premise deployment",
      ],
      icon: <Wallet className="h-5 w-5" />,
    },
  ];

  const transactions = [
    { id: 1, date: "Dec 1, 2024", description: "Pro Plan - Monthly", amount: "$79.00", status: "paid" },
    { id: 2, date: "Nov 1, 2024", description: "Pro Plan - Monthly", amount: "$79.00", status: "paid" },
    { id: 3, date: "Oct 15, 2024", description: "Additional Credits", amount: "$25.00", status: "paid" },
    { id: 4, date: "Oct 1, 2024", description: "Pro Plan - Monthly", amount: "$79.00", status: "paid" },
  ];

  const invoices = [
    { id: "INV-2024-012", date: "Dec 1, 2024", amount: "$79.00", status: "paid" },
    { id: "INV-2024-011", date: "Nov 1, 2024", amount: "$79.00", status: "paid" },
    { id: "INV-2024-010", date: "Oct 15, 2024", amount: "$25.00", status: "paid" },
    { id: "INV-2024-009", date: "Oct 1, 2024", amount: "$79.00", status: "paid" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and payments</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Balance & Transactions</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">$245.00</div>
                  <p className="text-sm text-muted-foreground mt-1">Available credits</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    This Month Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">$54.00</div>
                  <div className="mt-2">
                    <Progress value={68} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">68% of budget used</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Next Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">Jan 1</div>
                  <p className="text-sm text-muted-foreground mt-1">$79.00 Pro Plan</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{tx.amount}</p>
                        <Badge variant="secondary" className="capitalize">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Methods</CardTitle>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-primary/50 bg-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Default</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 rounded bg-gradient-to-r from-orange-600 to-orange-400 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">•••• •••• •••• 8888</p>
                      <p className="text-sm text-muted-foreground">Expires 06/26</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Set Default</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Download your invoices and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">{invoice.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-foreground">{invoice.amount}</p>
                        <Badge variant="secondary" className="capitalize">
                          {invoice.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`bg-card border-border relative ${
                    currentPlan === plan.id ? "border-primary ring-2 ring-primary/20" : ""
                  } ${plan.popular ? "scale-105" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div
                      className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                        currentPlan === plan.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.icon}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={currentPlan === plan.id ? "outline" : "default"}
                      disabled={currentPlan === plan.id}
                    >
                      {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
