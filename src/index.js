import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import "core-js";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { CSpinner, useColorModes } from "@coreui/react";
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate persistor={persistor} l loading={<CSpinner color="primary" variant="grow" />}>
      <App />
    </PersistGate>
  </Provider>,
);
