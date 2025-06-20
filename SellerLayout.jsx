import { NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerLayout = () => {
  const { axios, navigate, user } = useAppContext();
  const loggedInUser = user || JSON.parse(localStorage.getItem("user"));

  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    { name: "User Details", path: "/seller/user-details", icon: assets.user_details_icon },
  ];

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/seller/logout");
      if (data.success) {
        toast.success(data.message);
        localStorage.removeItem("user");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl flex flex-col justify-between">
        <div>
          {/* Logo and Title */}
          <div className="flex flex-col items-center py-6 border-b border-gray-200">
            <img src={assets.logo} alt="Logo" className="w-24 h-24 object-contain" />
            <h2 className="text-xl font-bold mt-2 text-gray-700">Seller Panel</h2>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-3">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/seller"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                  }`
                }
              >
                <img src={link.icon} alt={link.name} className="w-5 h-5" />
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-md px-6 py-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome to Seller Dashboard
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
