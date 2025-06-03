import React, { createContext, useContext, useState } from 'react';

const SpaContext = createContext();

export const SpaProvider = ({ children }) => {
    // Danh sách các spa
    const [spas, setSpas] = useState([]);
    // Thời gian cập nhật cuối cùng của danh sách spa
    const [lastUpdated, setLastUpdated] = useState(null);
    // Danh sách các dịch vụ có sẵn
    const [availableServices, setAvailableServices] = useState([]);

    // Cập nhật danh sách spa và thời gian cập nhật
    const updateSpas = (newSpas) => {
        setSpas(newSpas);
        setLastUpdated(Date.now());
    };

    // Cập nhật danh sách dịch vụ có sẵn
    const updateAvailableServices = (services) => {
        setAvailableServices(services);
    };

    return (
        <SpaContext.Provider value={{ spas, updateSpas, lastUpdated, availableServices, updateAvailableServices }}>
            {children}
        </SpaContext.Provider>
    );
};

export const useSpaContext = () => {
    const context = useContext(SpaContext);
    if (!context) {
        throw new Error('useSpaContext phải được dùng trong SpaProvider');
    }
    return context;
};