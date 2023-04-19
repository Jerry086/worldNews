import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Bookmarks from "./components/Bookmarks";
import NewsDetail from "./components/NewsDetail";
import SavedNews from "./components/SavedNews";
import Profile from "./components/Profile";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import VerifyUser from "./components/VerifyUser";
import AuthDebugger from "./components/AuthDebugger";
// Auth0 Context, exposes Auth0 methods and data
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";
import "./style/normalize.css";
import "./style/index.css";

const container = document.getElementById("root");

const requestedScopes = [
  "profile",
  "email",
  "read:todoitem",
  "read:user",
  "edit:todoitem",
  "edit:user",
  "delete:todoitem",
  "delete:user",
  "write:user",
  "write:todoitem",
];

// authentication required to access the app, otherwise redirect to home
function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const root = ReactDOMClient.createRoot(container);

root.render(
  <React.StrictMode>
    <Auth0Provider
      // configuration from environment variables
      // domain and client ID of the Auth0 application
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      // window.location.origin - origin URL of the current window (no path)
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        // audience of the Auth0 API - our todoAPI
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        // generate a token with specific scopes, the react app can only perform the actions
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>   {/* provide context(access token) to children */}
        <BrowserRouter>
          <Routes>
            {/* pages that don't require authentication */}
            <Route path="/" element={<AppLayout />} >
              <Route index element={<Home />} />
              <Route path=":sourceID/:newsID" element={<NewsDetail />} />  
            </Route>
            <Route path="/verify-user" element={<VerifyUser />} />
            {/* pages that require authentication */}
            <Route path="app" element={
                <RequireAuth>
                  <AppLayout/>
                </RequireAuth>
              }
            >
              <Route index element={<Profile />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path=":sourceID/:newsID" element={<NewsDetail />} />
              <Route path="debugger" element={<AuthDebugger />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);
