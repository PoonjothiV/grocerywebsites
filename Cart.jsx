import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    axios,
    user,
    setCartItems,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const product = products.find((item) => item._id === key);
      if (product) {
        product.quantity = cartItems[key];
        tempArray.push(product);
      }
    }
    setCartArray(tempArray);
  };

  const getUserAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const placeOrder = async () => {
    try {
      if (!user) {
        toast.error("You must be logged in to place an order");
        navigate("/login");
        return;
      }

      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      const orderPayload = {
        userId: user._id,
        items: cartArray.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: selectedAddress._id,
      };

      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", orderPayload);
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/order/stripe", orderPayload);
        if (data.success) {
          window.location.replace(data.url);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const generateBill = () => {
  // Check if the user is logged in
  if (!user || !user.email) {
    toast.error("You must be logged in to download the bill.");
    return;
  }

  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("Order Bill", 14, 20);

  // Customer Name
  const customerName = user?.name || "Customer";
  doc.setFontSize(12);
  doc.text(`Customer: ${customerName}`, 14, 26);

  // Table Header
  const tableStartY = 35;
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255); // White text
  doc.setFillColor(128, 0, 128);   // Purple header
  doc.rect(14, tableStartY - 5, 180, 10, 'F'); // Header background
  
  doc.text("Product", 14, tableStartY);
  doc.text("Qty", 100, tableStartY);
  doc.text("Price", 140, tableStartY);
  doc.text("Total", 180, tableStartY);

  // Table Content
  let yOffset = tableStartY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Black text

  cartArray.forEach((item, index) => {
    // Row Background Color
    doc.setFillColor(230, 240, 255); // Mild blue
    doc.rect(14, yOffset - 5, 180, 10, 'F'); // Background for row

    // Text for each column
    doc.text(item.name, 14, yOffset);
    doc.text(item.quantity.toString(), 100, yOffset);
    doc.text(`${currency}${item.offerPrice.toFixed(2)}`, 140, yOffset);
    doc.text(`${currency}${(item.offerPrice * item.quantity).toFixed(2)}`, 180, yOffset);

    // Row Border (Vertical Lines)
    doc.setLineWidth(0.5);
    doc.rect(14, yOffset - 5, 180, 10); // Cell Border

    yOffset += 10;
  });

  // Add extra space between products and date
  yOffset += 10;

  // Date
  const date = new Date();
  doc.setFillColor(230, 240, 255);
  doc.rect(14, yOffset - 5, 180, 10, 'F');
  doc.text(`Date: ${date.toLocaleDateString()}`, 14, yOffset);
  yOffset += 10;

  // Address
  const address = selectedAddress
    ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
    : "No address selected";
  doc.setFillColor(230, 240, 255);
  doc.rect(14, yOffset - 5, 180, 10, 'F');
  doc.text(`Shipping Address: ${address}`, 14, yOffset);
  yOffset += 10;

  // Subtotal
  const subtotal = getCartAmount();
  doc.setFillColor(230, 240, 255);
  doc.rect(14, yOffset - 5, 180, 10, 'F');
  doc.text(`Subtotal: ${currency}${subtotal.toFixed(2)}`, 14, yOffset);
  yOffset += 10;

  // Tax
  const tax = subtotal * 0.02;
  doc.setFillColor(230, 240, 255);
  doc.rect(14, yOffset - 5, 180, 10, 'F');
  doc.text(`Tax (2%): ${currency}${tax.toFixed(2)}`, 14, yOffset);
  yOffset += 10;

  // Total
  const total = subtotal + tax;
  doc.setFillColor(230, 240, 255);
  doc.rect(14, yOffset - 5, 180, 10, 'F');
  doc.text(`Total: ${currency}${total.toFixed(2)}`, 14, yOffset);

  // Save with customer name in filename
  const safeName = customerName.replace(/\s+/g, "_").toLowerCase();
  const fileName = `order-bill_${safeName}.pdf`;
  doc.save(fileName);

  toast.success("Bill generated and ready to download!");
};

  
  
  
  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (user) {
      getUserAddress();
    }
  }, [user]);
  

  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row mt-16">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary">{getCartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded"
              >
                <img
                  className="max-w-full h-full object-cover"
                  src={product.image[0]}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>Weight: <span>{product.weight || "N/A"}</span></p>
                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      onChange={(e) => updateCartItem(product._id, Number(e.target.value))}
                      value={cartItems[product._id]}
                      className="outline-none"
                    >
                      {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9)
                        .fill("")
                        .map((_, index) => (
                          <option key={index} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>
            <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto">
              <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
            </button>
          </div>
        ))}

        <button
          onClick={() => {
            navigate("/products");
            scrollTo(0, 0);
          }}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium"
        >
          <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
          Continue Shopping
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500">
              {selectedAddress
                ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                : "No address found"}
            </p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-primary hover:underline cursor-pointer"
            >
              Change
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                {addresses.map((address, index) => (
                  <p
                    key={index}
                    onClick={() => { setSelectedAddress(address); setShowAddress(false); }}
                    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {address.street}, {address.city}, {address.state}, {address.country}
                  </p>
                ))}
                <p
                  onClick={() => navigate("/add-address")}
                  className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10"
                >
                  Add address
                </p>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{currency}{getCartAmount()}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between font-semibold mt-3">
            <span>Total</span>
            <span>{currency}{getCartAmount()}</span>
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button onClick={generateBill} className="w-full py-2 bg-primary text-white font-medium rounded-md">
            Download Bill
          </button>
          <button
            onClick={placeOrder}
            className="w-full py-2 bg-primary text-white font-medium rounded-md"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center">
      <p>No products found</p>
    </div>
  );
};

export default Cart;
