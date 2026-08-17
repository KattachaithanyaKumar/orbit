"use client";

import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "../store";
import { hydrate } from "../store/auth-slice";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    store.dispatch(hydrate());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
