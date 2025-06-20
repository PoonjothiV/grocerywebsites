import React, { useEffect, useState } from 'react';
import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import BestSeller from '../components/BestSeller';
import BottomBanner from '../components/BottomBanner';
import NewsLetter from '../components/NewsLetter';
import { useAppContext } from '../context/AppContext';

const Home = () => {
  const { user } = useAppContext();
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    if (user && user.name) {
      setLoggedInUser(user);
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name) {
          setLoggedInUser(parsedUser);
        }
      }
    }
  }, [user]);

  return (
    <div className="mt-10">
      {/* Show welcome message only if loggedInUser exists */}
      {loggedInUser?.name && (
        <div className="text-xl font-semibold text-center mb-4 text-primary">
          {/* Welcome, {loggedInUser.name}! */}
        </div>
      )}
      
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <NewsLetter />
    </div>
  );
};

export default Home;
