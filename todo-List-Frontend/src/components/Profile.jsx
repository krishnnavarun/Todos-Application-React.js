import { useEffect, useMemo, useState } from 'react';
import { UserRound, Mail, Shield, CalendarDays, ArrowLeft, LogOut, Upload, X } from 'lucide-react';

const Profile = ({ onBackToTodos, onLogout }) => {
  const [user, setUser] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageSuccess, setImageSuccess] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const joinedOn = useMemo(() => {
    if (!user?.createdAt) return 'Not available';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file');
      return;
    }

    setIsUploadingImage(true);
    setImageError('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result;
        
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/auth/profile-image', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profileImage: base64Image })
        });

        const data = await response.json();

        if (response.ok) {
          const updatedUser = { ...user, profileImage: data.user.profileImage };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setImageSuccess('Profile image updated successfully');
          setShowImageUpload(false);
          setTimeout(() => setImageSuccess(''), 3000);
        } else {
          setImageError(data.error || 'Failed to update profile image');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setImageError('Error uploading image: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUrlUpload = async (url) => {
    if (!url.trim()) {
      setImageError('Please enter a valid image URL');
      return;
    }

    setIsUploadingImage(true);
    setImageError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/profile-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileImage: url })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, profileImage: data.user.profileImage };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setImageSuccess('Profile image updated successfully');
        setShowImageUpload(false);
        setTimeout(() => setImageSuccess(''), 3000);
      } else {
        setImageError(data.error || 'Failed to update profile image');
      }
    } catch (err) {
      setImageError('Error updating image: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-10 lg:py-12 relative">
      <div className="grain-overlay"></div>
      <div className="mx-auto max-w-5xl relative z-10 space-y-6 slide-up">
        <header className="frost-card rounded-3xl px-5 py-5 md:px-8 md:py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="uppercase text-xs tracking-[0.18em] text-cyan-100/70 mb-1">Account</p>
            <h1 className="text-3xl md:text-4xl text-white font-bold">Profile</h1>
            <p className="text-cyan-50/80 mt-1 text-sm md:text-base">Manage your account and workspace identity.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onBackToTodos}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition"
            >
              <ArrowLeft size={16} />
              Back to Todos
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white font-medium hover:bg-rose-700 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {imageSuccess && (
          <div className="surface-card border border-emerald-200 bg-emerald-50 p-4 rounded-2xl">
            <p className="text-emerald-800 font-medium text-sm">{imageSuccess}</p>
          </div>
        )}

        <section className="surface-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative flex-shrink-0">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center border-2 border-cyan-200">
                  <UserRound size={48} />
                </div>
              )}
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="absolute bottom-0 right-0 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-2 transition shadow-lg"
              >
                <Upload size={16} />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'User'}</h2>
              <p className="text-slate-500 mt-1">Personal account overview</p>
              
              {showImageUpload && (
                <div className="mt-4 space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2">
                      Upload Image File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Max 5MB, PNG/JPG/GIF</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-2 bg-slate-50 text-slate-600">or</span>
                    </div>
                  </div>

                  <div>
                    <ImageUrlForm onSubmit={handleImageUrlUpload} isLoading={isUploadingImage} />
                  </div>

                  <button
                    onClick={() => {
                      setShowImageUpload(false);
                      setImageError('');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition font-medium"
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  {imageError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{imageError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Email</p>
              <p className="text-slate-900 font-semibold inline-flex items-center gap-2">
                <Mail size={16} className="text-cyan-700" />
                {user?.email || 'Not available'}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Role</p>
              <p className="text-slate-900 font-semibold inline-flex items-center gap-2 capitalize">
                <Shield size={16} className="text-cyan-700" />
                {user?.role || 'customer'}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Joined On</p>
              <p className="text-slate-900 font-semibold inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-cyan-700" />
                {joinedOn}
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

const ImageUrlForm = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(url);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-xs uppercase tracking-wide text-slate-600 font-semibold">
        Image URL
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Uploading...' : 'Set'}
        </button>
      </div>
    </form>
  );
};

export default Profile;