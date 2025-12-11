'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Plus, Trash2, Star, DollarSign, Truck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Vendor {
  id: string;
  name: string;
  itemDescription: string;
  partNumber: string;
  price: number;
  shippingCost: number;
  leadTime: number;
  rating: number;
  notes: string;
}

export function VendorComparison() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [itemName, setItemName] = useState('');

  const [newVendor, setNewVendor] = useState({
    name: '',
    itemDescription: '',
    partNumber: '',
    price: 0,
    shippingCost: 0,
    leadTime: 1,
    rating: 5,
    notes: ''
  });

  const addVendor = () => {
    if (!newVendor.name || !newVendor.itemDescription) return;

    const vendor: Vendor = {
      id: Date.now().toString(),
      ...newVendor
    };

    setVendors([...vendors, vendor]);
    setNewVendor({
      name: '',
      itemDescription: '',
      partNumber: '',
      price: 0,
      shippingCost: 0,
      leadTime: 1,
      rating: 5,
      notes: ''
    });
  };

  const removeVendor = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const getBestPrice = () => {
    if (vendors.length === 0) return null;
    return Math.min(...vendors.map(v => v.price + v.shippingCost));
  };

  const getBestLeadTime = () => {
    if (vendors.length === 0) return null;
    return Math.min(...vendors.map(v => v.leadTime));
  };

  const getBestRating = () => {
    if (vendors.length === 0) return null;
    return Math.max(...vendors.map(v => v.rating));
  };

  const getRecommendation = () => {
    if (vendors.length === 0) return null;

    const scored = vendors.map(v => {
      const totalCost = v.price + v.shippingCost;
      const bestPrice = getBestPrice() || 1;
      const bestTime = getBestLeadTime() || 1;
      const bestRating = getBestRating() || 5;

      const priceScore = (bestPrice / totalCost) * 40;
      const timeScore = (bestTime / v.leadTime) * 30;
      const ratingScore = (v.rating / bestRating) * 30;

      return {
        vendor: v,
        score: priceScore + timeScore + ratingScore
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].vendor;
  };

  const recommended = getRecommendation();
  const bestPrice = getBestPrice();
  const bestLeadTime = getBestLeadTime();
  const bestRating = getBestRating();

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Vendor Comparison Tool</CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Compare prices, specifications, and delivery times across multiple vendors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Item Name */}
          <div className="p-4 glass-surface border border-white/10 rounded-lg">
            <Label htmlFor="itemName" className="text-white">Item/Component Being Compared</Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., 200A Main Circuit Breaker Panel"
              className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
            />
          </div>

          {/* Add Vendor Form */}
          <div className="space-y-4 p-4 border-2 border-dashed border-[#9C4AFF]/40 rounded-lg glass-surface">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
              <Plus className="h-5 w-5 text-[#9C4AFF]" />
              Add Vendor Quote
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Vendor Name</Label>
                <Input
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  placeholder="Home Depot"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Part Number</Label>
                <Input
                  value={newVendor.partNumber}
                  onChange={(e) => setNewVendor({ ...newVendor, partNumber: e.target.value })}
                  placeholder="SKU-12345"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-white">Item Description</Label>
                <Input
                  value={newVendor.itemDescription}
                  onChange={(e) => setNewVendor({ ...newVendor, itemDescription: e.target.value })}
                  placeholder="Square D QO 200A 40-Space Panel"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newVendor.price}
                  onChange={(e) => setNewVendor({ ...newVendor, price: Number(e.target.value) })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Shipping Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newVendor.shippingCost}
                  onChange={(e) => setNewVendor({ ...newVendor, shippingCost: Number(e.target.value) })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Lead Time (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newVendor.leadTime}
                  onChange={(e) => setNewVendor({ ...newVendor, leadTime: Number(e.target.value) })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Vendor Rating (1-5)</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setNewVendor({ ...newVendor, rating })}
                      className={`p-2 rounded transition-colors ${
                        rating <= newVendor.rating
                          ? 'text-[#FF6B00]'
                          : 'text-white/20'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <Label className="text-white">Notes (Optional)</Label>
                <Textarea
                  value={newVendor.notes}
                  onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                  placeholder="Special terms, warranty info, etc."
                  rows={2}
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
            </div>
            <Button onClick={addVendor} className="w-full gradient-violet text-white hover:shadow-glowViolet">
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>

          {/* Vendor Comparison Cards */}
          {vendors.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white">
                Vendor Comparison ({vendors.length} vendors)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.map((vendor) => {
                  const totalCost = vendor.price + vendor.shippingCost;
                  const isRecommended = recommended?.id === vendor.id;
                  const isBestPrice = totalCost === bestPrice;
                  const isBestTime = vendor.leadTime === bestLeadTime;
                  const isBestRating = vendor.rating === bestRating;

                  return (
                    <Card key={vendor.id} className={`relative glass-surface border ${isRecommended ? 'border-[#00E5FF] shadow-glowCyan' : 'border-white/10'}`}>
                      {isRecommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="gradient-aqua text-white font-semibold px-4 py-1">
                            ⭐ Recommended
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-white">{vendor.name}</CardTitle>
                            <p className="text-xs text-[#B8A7E0] mt-1">{vendor.partNumber}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVendor(vendor.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 -mt-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-[#B8A7E0] mt-2">{vendor.itemDescription}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#B8A7E0] flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              Price
                            </span>
                            <span className="font-semibold text-white">${vendor.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#B8A7E0] flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              Shipping
                            </span>
                            <span className="font-semibold text-white">${vendor.shippingCost.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span className="text-sm font-medium text-white">Total Cost</span>
                            <span className={`text-lg font-bold ${isBestPrice ? 'text-green-400' : 'text-white'}`}>
                              ${totalCost.toFixed(2)}
                              {isBestPrice && <Badge variant="outline" className="ml-2 text-xs border-green-400 text-green-400">Best</Badge>}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#B8A7E0] flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Lead Time
                          </span>
                          <span className={`font-semibold ${isBestTime ? 'text-green-400' : 'text-white'}`}>
                            {vendor.leadTime} days
                            {isBestTime && <Badge variant="outline" className="ml-2 text-xs border-green-400 text-green-400">Best</Badge>}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#B8A7E0]">Rating</span>
                          <div className={`flex items-center gap-1 ${isBestRating ? 'text-green-400' : 'text-[#FF6B00]'}`}>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < vendor.rating ? 'fill-current' : 'opacity-30'}`} />
                              ))}
                            </div>
                            {isBestRating && <Badge variant="outline" className="ml-2 text-xs border-green-400 text-green-400">Best</Badge>}
                          </div>
                        </div>

                        {vendor.notes && (
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-xs text-[#B8A7E0]">{vendor.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <Card className="bg-gradient-to-br from-[#9C4AFF]/20 to-[#FF6B00]/20 border border-[#9C4AFF]/30">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-[#B8A7E0] mb-2">Best Price</div>
                      <div className="text-2xl font-bold text-[#00E5FF]">${bestPrice?.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#B8A7E0] mb-2">Fastest Delivery</div>
                      <div className="text-2xl font-bold text-[#00E5FF]">{bestLeadTime} days</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#B8A7E0] mb-2">Highest Rating</div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-[#00E5FF]">{bestRating?.toFixed(1)}</div>
                        <div className="flex text-[#FF6B00]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < (bestRating || 0) ? 'fill-current' : 'opacity-30'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {vendors.length === 0 && (
            <div className="text-center py-12 text-[#B8A7E0]">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add vendor quotes to compare prices and specifications</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}