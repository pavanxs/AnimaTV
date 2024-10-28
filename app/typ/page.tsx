'use client'

import React from 'react'
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, ArrowUpDown } from 'lucide-react'

export default function OrderBookPage() {
  const [orderType, setOrderType] = React.useState('buy')
  const [reputationScore, setReputationScore] = React.useState(50)

  const dummyOrders = [
    { type: 'buy', price: 80, amount: 100, reputation: 75, time: '10:30 AM' },
    { type: 'sell', price: 82, amount: 150, reputation: 60, time: '10:35 AM' },
    // Add more dummy orders as needed
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Panel */}
      <div className="w-1/4 p-4 border-r">
        <h2 className="text-2xl font-bold mb-4">Create New Order</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Buy/Sell</span>
            <Switch
              checked={orderType === 'buy'}
              onCheckedChange={(checked) => setOrderType(checked ? 'buy' : 'sell')}
            />
          </div>
          <Input type="number" placeholder="USDT amount" />
          <Input type="number" placeholder="INR price per USDT" />
          <div>Current market price: ₹81.50</div>
          <div>
            <label className="block mb-2">Minimum reputation score</label>
            <Slider
              value={[reputationScore]}
              onValueChange={(value) => setReputationScore(value[0])}
              max={100}
              step={1}
            />
          </div>
          <Button className="w-full">Create Order</Button>
          <div>Your current reputation score: 70</div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="w-2/4 p-4">
        <h2 className="text-2xl font-bold mb-4">Order Book</h2>
        <Tabs defaultValue="buy">
          <TabsList>
            <TabsTrigger value="buy">Buy Orders</TabsTrigger>
            <TabsTrigger value="sell">Sell Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="buy">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Price (INR/USDT)</TableHead>
                  <TableHead>Amount (USDT)</TableHead>
                  <TableHead>Total Value (INR)</TableHead>
                  <TableHead>Reputation</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyOrders.map((order, index) => (
                  <TableRow key={index} className={order.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                    <TableCell>{order.type.toUpperCase()}</TableCell>
                    <TableCell>{order.price}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>{order.price * order.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {order.reputation}
                        <Star className="ml-1 h-4 w-4 fill-yellow-400" />
                      </div>
                    </TableCell>
                    <TableCell>{order.time}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Match</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="sell">
            {/* Similar table structure for sell orders */}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel */}
      <div className="w-1/4 p-4 border-l">
        <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
        <Card>
          <CardHeader>
            <CardTitle>Market Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>24h Price Range: ₹80.00 - ₹83.00</div>
              <div>Avg. Reputation Score: 72</div>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Your Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div>2 Buy Orders</div>
            <div>1 Sell Order</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

