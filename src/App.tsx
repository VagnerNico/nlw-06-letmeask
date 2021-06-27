import { useEffect, useState, ReactElement, useCallback } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider, User } from "./contexts/AuthContext";
import { LoaderContextProvider } from "./contexts/LoaderContext";
import { AdminRoom } from "./pages/AdminRoom";
import { Home } from "./pages/Home";
import { NewRoom } from "./pages/NewRoom";
import { Room } from "./pages/Room";
import { auth, firebase } from "./services/firebase";

import "./styles/global.scss";

function App(): ReactElement {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState<boolean>(false);

  function handleGoogleUser(googleUser: firebase.User) {
    if (googleUser) {
      const { displayName, photoURL, uid } = googleUser;
      if (!displayName || !photoURL)
        throw new Error("Missing information from Google Account");
      setUser({
        avatar: photoURL,
        name: displayName,
        id: uid,
      });
    }
  }

  const changeLoadingState = useCallback((loadingState: boolean): void => {
    setLoading(loadingState);
  }, []);

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

    if (result.user) handleGoogleUser(result.user);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((googleUser) => {
      if (googleUser) handleGoogleUser(googleUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContextProvider user={user} signInWithGoogle={signInWithGoogle}>
      {loading ? (
        <div className="indeterminate-progress">
          <div />
          <div />
        </div>
      ) : undefined}
      <LoaderContextProvider
        changeLoadingState={changeLoadingState}
        loading={loading}
      >
        <Toaster position="top-right" reverseOrder={false} />
        <BrowserRouter>
          <Switch>
            <Route component={Home} exact path="/" />
            <Route component={NewRoom} exact path="/rooms/new" />
            <Route component={Room} path="/rooms/:id" />
            <Route component={AdminRoom} path="/admin/rooms/:id" />
          </Switch>
        </BrowserRouter>
      </LoaderContextProvider>
    </AuthContextProvider>
  );
}

export default App;
