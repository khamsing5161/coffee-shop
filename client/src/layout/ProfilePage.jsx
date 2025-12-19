import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from '../components/Nav/Navbar'

function ProfilePage() {
  const [profile, setProfile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setProfile(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError(error.response?.data?.message || 'Failed to load profile')
        setLoading(false)

        // Redirect to login if unauthorized
        if (error.response?.status === 401) {
          navigate('/login')
        }
      }
    }

    fetchProfile()
  }, [token, navigate]) // ✅ Add dependencies

  // Loading state
  if (loading) {
    return <div>Loading...</div>
  }

  // Error state
  if (error) {
    return <div>Error: {error}</div>
  }

  // No profile found
  if (!profile) {
    return <div>No profile data available</div>
  }

  // Success - render profile
  return (
    <>
    <Navbar />
      <div className="min-h-screen bg-amber-50 flex justify-center items-start p-6">
        <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-amber-800 mb-6">
            👤 My Profile
          </h2>

          {/* รูปโปรไฟล์ */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={
                profile.profile_image
                  ? `http://localhost:5000${profile.profile_image}`
                  : "https://via.placeholder.com/120"
              }
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border"
            />
          </div>

          {/* ข้อมูลผู้ใช้ */}
          <div className="text-center space-y-1">
            <p className="font-semibold">{profile.name}</p>
            <p className="text-gray-600">{profile.email}</p>
            <p className="text-gray-600">{profile.phone}</p>
            <p className="text-gray-600">{profile.gender}</p>
            <p className="text-gray-600">{profile.address}</p>
            <p className="text-gray-600">{profile.points}</p>
            <p className="text-gray-600"><Link to="/profile-register">profile register</Link></p>
            
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage