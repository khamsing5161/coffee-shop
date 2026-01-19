import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [UpdateOrder, setUpdateOrder] = useState(false);
  

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ---------------------------
  // โหลดข้อมูลตะกร้า
  // ---------------------------
  const fetchCart = async () => {
    if (!token) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("http://localhost:5000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(res.data.items || []);
      setOrderId(res.data.order_id);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Load cart error:", err);
      setError(err.response?.data?.error || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // โหลด cart เมื่อ mount
  useEffect(() => {
    fetchCart();
  }, []);

  // ---------------------------
  // เพิ่มจำนวนสินค้า
  // ---------------------------
  const increaseQty = async (item) => {
    try {
      setUpdating(item.order_item_id);

      await axios.put(
        "http://localhost:5000/api/cart/update_qty",
        {
          order_item_id: item.order_item_id,
          qty: item.qty + 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update UI
      setCartItems((prev) =>
        prev.map((i) =>
          i.order_item_id === item.order_item_id
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      );

      // Recalculate total
      const newTotal = cartItems.reduce((sum, i) => {
        if (i.order_item_id === item.order_item_id) {
          return sum + i.price * (i.qty + 1);
        }
        return sum + i.price * i.qty;
      }, 0);
      setTotal(newTotal);
    } catch (err) {
      console.error("Increase qty error:", err);
      alert(err.response?.data?.error || "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  // ---------------------------
  // ลดจำนวนสินค้า
  // ---------------------------
  const decreaseQty = async (item) => {
    if (item.qty <= 1) {
      // ถ้าเหลือ 1 ให้ลบทิ้งเลย
      removeItem(item.order_item_id);
      return;
    }

    try {
      setUpdating(item.order_item_id);

      await axios.put(
        "http://localhost:5000/api/cart/update_qty",
        {
          order_item_id: item.order_item_id,
          qty: item.qty - 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update UI
      setCartItems((prev) =>
        prev.map((i) =>
          i.order_item_id === item.order_item_id
            ? { ...i, qty: i.qty - 1 }
            : i
        )
      );

      // Recalculate total
      const newTotal = cartItems.reduce((sum, i) => {
        if (i.order_item_id === item.order_item_id) {
          return sum + i.price * (i.qty - 1);
        }
        return sum + i.price * i.qty;
      }, 0);
      setTotal(newTotal);
    } catch (err) {
      console.error("Decrease qty error:", err);
      alert(err.response?.data?.error || "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  // ---------------------------
  // ลบสินค้าออกจากตะกร้า
  // ---------------------------
  const removeItem = async (order_item_id) => {
    if (!confirm("Remove this item from cart?")) return;

    try {
      setUpdating(order_item_id);

      await axios.delete(
        `http://localhost:5000/api/cart/remove_item/${order_item_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update UI
      setCartItems((prev) =>
        prev.filter((item) => item.order_item_id !== order_item_id)
      );

      // Recalculate total
      const newTotal = cartItems
        .filter((i) => i.order_item_id !== order_item_id)
        .reduce((sum, i) => sum + i.price * i.qty, 0);
      setTotal(newTotal);
    } catch (err) {
      console.error("Remove item error:", err);
      alert(err.response?.data?.error || "Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  // ---------------------------
  // ล้างตะกร้าทั้งหมด
  // ---------------------------
  const clearCart = async () => {
    if (!confirm("Clear all items from cart?")) return;

    try {
      await axios.delete("http://localhost:5000/api/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems([]);
      setTotal(0);
      setOrderId(null);
    } catch (err) {
      console.error("Clear cart error:", err);
      alert(err.response?.data?.error || "Failed to clear cart");
    }
  };

  // ---------------------------
  // ไปหน้า Checkout
  // ---------------------------
  const handleCheckout = async () => {
    try {
      setUpdateOrder(true);
      await axios.put(
        "http://localhost:5000/api/cart_update",
        {
          order_id: orderId
      
        },
        {
          headers: { Authorization: `Bearer ${token}` }

        }
      );
      navigate("/payment")

    } catch (err) {
      console.error("payment :", err);
      alert(err.response?.data?.error || "Failed to clear cart");

    }

    

  }

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("lo-LA").format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-bold mb-2">❌ Error</p>
          <p>{error}</p>
          <button
            onClick={fetchCart}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <section className="flex-1 px-4 md:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-amber-900">
              Your Cart 🛒
            </h1>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Cart Content */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            {cartItems.length === 0 ? (
              // Empty Cart
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 text-lg mb-4">
                  Your cart is empty
                </p>
                <button
                  onClick={() => navigate("/menu")}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              // Cart Items
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex items-center gap-4 border-b pb-4 last:border-b-0"
                  >
                    {/* Product Image */}
                    {item.product_image && (
                      <img
                        src={`http://localhost:5000${item.product_image}`}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-amber-900">
                        {item.product_name}
                      </h3>
                      <p className="text-gray-600">
                        {formatPrice(item.price)} ₭
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQty(item)}
                        disabled={updating === item.order_item_id}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => increaseQty(item)}
                        disabled={updating === item.order_item_id}
                        className="bg-amber-700 hover:bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[100px]">
                      <p className="text-lg font-bold text-amber-900">
                        {formatPrice(item.item_total)} ₭
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.order_item_id)}
                      disabled={updating === item.order_item_id}
                      className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Total & Checkout */}
            {cartItems.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold text-gray-700">
                    Total:
                  </span>
                  <span className="text-3xl font-bold text-amber-900">
                    {formatPrice(total)} ₭
                  </span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate("/menu")}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout 💳
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                📝 Order Summary
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Order ID: #{orderId}</p>
                <p>• Total Items: {cartItems.length}</p>
                <p>
                  • Total Quantity:{" "}
                  {cartItems.reduce((sum, item) => sum + item.qty, 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CartPage;