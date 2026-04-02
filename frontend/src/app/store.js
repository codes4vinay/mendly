import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../features/auth/authSlice";
import notificationReducer from "../features/notification/notificationSlice";
import chatReducer from "../features/chat/chatSlice";
import chatbotReducer from "../features/chatbot/chatbotSlice";

const persistConfig = {
    key: "root",
    version: 1,
    storage,
};

const rootReducer = combineReducers({
    auth: authReducer,
    notification: notificationReducer,
    chat: chatReducer,
    chatbot: chatbotReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "persist/PERSIST",
                    "persist/REHYDRATE",
                    "persist/PAUSE",
                    "persist/PURGE",
                    "persist/REGISTER",
                    "persist/FLUSH",
                ],
            },
        }),
});

export const persistor = persistStore(store);
export default store;