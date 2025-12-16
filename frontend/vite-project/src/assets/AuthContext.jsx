import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Invalid user data in localStorage:", error);
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem("token") || null;
        } catch (error) {
            console.error("Invalid token in localStorage:", error);
            return null;
        }
    });

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    // 🛑 नया फ़ंक्शन: सब्सक्रिप्शन डेटा को अपडेट करने के लिए 🛑
    const updateUserSubscription = (newSubscriptionData) => {
        setUser(prevUser => {
            if (!prevUser) return null; // अगर यूजर लॉग इन नहीं है तो कुछ न करें

            const updatedUser = {
                ...prevUser,
                subscription: {
                    ...prevUser.subscription,
                    ...newSubscriptionData, // नए डेटा से overwrite करें (जैसे applications_made_this_month)
                },
            };

            // लोकल स्टोरेज को भी अपडेट करें
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                token, 
                login, 
                logout, 
                setUser,
                updateUserSubscription 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};