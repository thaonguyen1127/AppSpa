import React, { createContext, useContext, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebaseConfig'; // Đường dẫn này đúng nếu file firebaseConfig.js nằm trong src/

const ClientSpaContext = createContext();

export const ClientSpaProvider = ({ children }) => {
  const [spaCache, setSpaCache] = useState({});
  const [reviewsCache, setReviewsCache] = useState({});

  // Lấy dữ liệu spa và reviews theo id, có cache
  const fetchSpaData = async (id) => {
    if (spaCache[id] && reviewsCache[id]) {
      return { spa: spaCache[id], reviews: reviewsCache[id] };
    }

    try {
      // Lấy spa
      const spaDocRef = doc(db, 'spas', id);
      const spaDoc = await getDoc(spaDocRef);
      const spaData = spaDoc.exists() ? { id: spaDoc.id, ...spaDoc.data() } : null;

      // Lấy reviews
      const reviewsColRef = collection(db, 'spas', id, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsColRef);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Lưu cache
      setSpaCache((prev) => ({ ...prev, [id]: spaData }));
      setReviewsCache((prev) => ({ ...prev, [id]: reviewsData }));

      return { spa: spaData, reviews: reviewsData };
    } catch (error) {
      console.error('Error fetching spa data:', error);
      return { spa: null, reviews: [] };
    }
  };

  return (
    <ClientSpaContext.Provider value={{ spaCache, reviewsCache, fetchSpaData }}>
      {children}
    </ClientSpaContext.Provider>
  );
};

// Custom hook để dùng context
export const useClientSpaContext = () => {
  const context = useContext(ClientSpaContext);
  if (!context) throw new Error('useClientSpaContext phải được dùng trong ClientSpaProvider');
  return context;
};