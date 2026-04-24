import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/shared/Layout";
import { formatPrice } from "@/utils/helpers";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("mendly_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const saveCart = (nextCart) => {
    setCart(nextCart);
    localStorage.setItem("mendly_cart", JSON.stringify(nextCart));
  };

  const updateQuantity = (item, delta) => {
    const nextQty = item.quantity + delta;
    if (nextQty <= 0) return;
    const nextCart = cart.map((row) =>
      row.productId === item.productId ? { ...row, quantity: nextQty } : row,
    );
    saveCart(nextCart);
  };

  const removeItem = (productId) => {
    const nextCart = cart.filter((item) => item.productId !== productId);
    saveCart(nextCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">My Cart</h1>
            <p className="text-muted-foreground mt-1">
              Review items before checkout
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/marketplace")}>
            Browse Products
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center border border-dashed border-slate-300 rounded-xl p-10">
            <p className="text-lg font-medium">Your cart is empty.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add products from the marketplace.
            </p>
            <Button className="mt-4" onClick={() => navigate("/marketplace")}>
              Go to Marketplace
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {cart.map((item) => (
                <Card key={item.productId} className="border">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{item.name}</h2>
                        <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                          {item.serviceCentreName || "Marketplace"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item, -1)}
                      >
                        -
                      </Button>
                      <span className="w-10 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item, 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-slate-50 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(subtotal)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <Button onClick={() => navigate("/checkout")}>
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
