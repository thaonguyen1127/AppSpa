// import React, { createContext, useContext, useState } from 'react';

// const SpaContext = createContext();

// export const SpaProvider = ({ children }) => {
//     const [spas, setSpas] = useState([]);
//     const [lastUpdated, setLastUpdated] = useState(null);

//     const updateSpas = (newSpas) => {
//         setSpas(newSpas);
//         setLastUpdated(Date.now());
//     };

//     return (
//         <SpaContext.Provider value={{ spas, updateSpas, lastUpdated }}>
//             {children}
//         </SpaContext.Provider>
//     );
// };

// export const useSpaContext = () => useContext(SpaContext);
import React, { createContext, useContext, useState } from 'react';

const SpaContext = createContext();

export const SpaProvider = ({ children }) => {
    const [spas, setSpas] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);

    const updateSpas = (newSpas) => {
        setSpas(newSpas);
        setLastUpdated(Date.now());
    };

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