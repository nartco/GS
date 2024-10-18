import React, { createContext, useContext, useState } from 'react';
import {  getPanier, savePanier } from './GestionStorage';
import { ToastAndroid } from "react-native"
const BagContext = createContext();

export const BagProvider = ({ children }) => {
    const [bagCount, setBagCount] = useState(0);
  

    return (
      <BagContext.Provider value={{ bagCount, setBagCount }}>
        {children}
      </BagContext.Provider>
    );
  };
  
  export const useBag = () => {
    const context = useContext(BagContext);
    if (!context) {
      throw new Error('useBag must be used within a BagProvider');
    }
    return context;
  };
  