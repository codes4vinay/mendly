import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import { formatPrice } from "@/utils/helpers";
import { openRazorpayCheckout } from "@/utils/razorpay";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

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

  const checkoutItems = location.state?.buyNowItems?.length
    ? location.state.buyNowItems
    : cart;

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [checkoutItems],
  );

  const handlePlaceOrder = async () => {
    if (!checkoutItems.length) {
      toast.error("Cart is empty");
      return;
    }

    if (!address.city || !address.pincode) {
      toast.error("Please provide city and pincode");
      return;
    }

    setLoading(true);
    try {
      // group by service centre
      const grouped = checkoutItems.reduce((memo, item) => {
        const key = item.serviceCentreId || "market";
        if (!memo[key])
          memo[key] = { serviceCentreId: item.serviceCentreId, items: [] };
        memo[key].items.push(item);
        return memo;
      }, {});

      const successfulProductIds = [];

      for (const key of Object.keys(grouped)) {
        const group = grouped[key];
        const totalAmount = group.items.reduce(
          (sum, row) => sum + row.price * row.quantity,
          0,
        );
        const res = await api.post("/orders", {
          serviceCentre: group.serviceCentreId,
          items: group.items.map((row) => ({
            product: row.productId,
            quantity: row.quantity,
            price: row.price,
          })),
          totalAmount,
          payment: { method: paymentMethod },
          deliveryAddress: { ...address },
        });

        const data = res.data.data;

        if (data.paymentRequired) {
          const paymentPayload = await openRazorpayCheckout({
            checkout: data.checkout,
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone,
            },
            notes: {
              entityType: "order",
              entityId: data.order._id,
            },
          });

          await api.post(`/orders/${data.order._id}/verify-payment`, paymentPayload);
        }

        successfulProductIds.push(...group.items.map((item) => item.productId));

        if (!location.state?.buyNowItems?.length) {
          const remainingCart = cart.filter(
            (item) => !successfulProductIds.includes(item.productId),
          );
          localStorage.setItem("mendly_cart", JSON.stringify(remainingCart));
          setCart(remainingCart);
        }
      }

      toast.success(
        paymentMethod === "cash"
          ? "Order placed successfully"
          : "Payment successful and order placed",
      );
      navigate("/my-orders");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutItems.length) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center border border-dashed border-slate-300 rounded-xl p-10">
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground mt-2">
              Your cart is empty. Add some products from marketplace.
            </p>
            <Button className="mt-4" onClick={() => navigate("/marketplace")}>
              Go to Marketplace
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground mt-1">
              Complete your order and payment details.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/cart")}>
            Back to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Street</label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="Street"
                  value={address.street}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, street: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">City</label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, city: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">State</label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, state: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium">Pincode</label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    placeholder="Pincode"
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        pincode: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Payment Method</label>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 bg-background"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={loading}
                >
                  <option value="razorpay">Pay Online (Razorpay Test)</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>
              {checkoutItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between py-1"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Button
                className="w-full mt-2"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading
                  ? paymentMethod === "cash"
                    ? "Placing order..."
                    : "Processing payment..."
                  : paymentMethod === "cash"
                    ? "Place Order"
                    : "Pay Now"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
