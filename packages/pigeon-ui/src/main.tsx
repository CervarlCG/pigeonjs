import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "./redux/store.ts";
import HomePage from "./pages/home/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        cssVar: true,
        components: {
          Input: {
            paddingBlock: 8,
            paddingInline: 16,
          },
          Space: {
            size: 160,
            sizeSM: 160,
            paddingSM: 1650,
          },
        },
      }}
    >
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ConfigProvider>
  </StrictMode>
);
