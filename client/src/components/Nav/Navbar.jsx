import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ===== Logout ===== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ===== Load Profile ===== */
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setUserProfile(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <nav className="bg-gray-800 px-6">
      <div className="flex h-16 items-center justify-between">

        {/* ===== Left ===== */}
        <div className="flex items-center gap-4">
          <button
            className="sm:hidden text-gray-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <XMarkIcon className="w-6" /> : <Bars3Icon className="w-6" />}
          </button>

          <Link to="/" className="text-white font-bold text-lg">
            ☕ Coffee App
          </Link>

          <div className="hidden sm:flex gap-4 ml-6">
            <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link to="/menu" className="text-gray-300 hover:text-white">Menu</Link>
            <Link to="/cart" className="text-gray-300 hover:text-white">Cart</Link>
            <Link to="/payment" className="text-gray-300 hover:text-white">Payment</Link>
            <Link to="/orders" className="text-gray-300 hover:text-white">Orders</Link>
          </div>
        </div>

        {/* ===== Right ===== */}
        <div className="flex items-center gap-4">

          {userProfile && (
            <div className="text-right text-sm text-white">
              <p className="font-semibold">{userProfile.name}</p>
              <p className="text-amber-400">
                ⭐ {userProfile.points} points
              </p>
            </div>
          )}

          <Link to="/profile">
            <img
              src={
                userProfile?.profile_image
                  ? `http://localhost:5000${userProfile.profile_image}`
                  : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
              }
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ===== Mobile Menu ===== */}
      {menuOpen && (
        <div className="sm:hidden mt-2 space-y-2">
          <Link to="/" className="block text-gray-300">Home</Link>
          <Link to="/menu" className="block text-gray-300">Menu</Link>
          <Link to="/cart" className="block text-gray-300">Cart</Link>
          <Link to="/payment" className="block text-gray-300">Payment</Link>
          <Link to="/orders" className="block text-gray-300">Orders</Link>
        </div>
      )}
    </nav>
  );
}
