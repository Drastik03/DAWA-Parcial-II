import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store/Store";
import Spinner from "./views/spinner/Spinner";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<AuthProvider>
			<Suspense fallback={<Spinner />}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</Suspense>
		</AuthProvider>
	</Provider>,
);
