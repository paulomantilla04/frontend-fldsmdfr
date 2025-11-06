"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        setChecking(false);
        router.push("/login");
        return;
      }
      try {
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
          throw new Error("Token inválido.");
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        const exp = payload.exp;

        if (!exp) {
          throw new Error("Token inválido (sin fecha de expiración).");
        }

        const now = Math.floor(Date.now() / 1000);

        if (now >= exp) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setChecking(false);
          setShowExpiredDialog(true);
          return;
        }

        router.push("/dashboard");
      } catch (error) {
        console.error("Error al verificar el token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setChecking(false);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error al verificar la autenticación:", error);
      setChecking(false);
      router.push("/login");
    }

    const handleGoToLogin = () => {
      setShowExpiredDialog(false);
      router.push("/login");
    };

    if (showExpiredDialog) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Sesión Expirada
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tu sesión ha caducado
                </p>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Su sesión ha expirado por seguridad. Por favor, inicie sesión
              nuevamente para continuar.
            </p>

            <button
              onClick={handleGoToLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <LogIn className="w-5 h-5" />
              Volver a Iniciar Sesión
            </button>
          </div>
        </main>
      );
    }

    if (checking) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spín rounded-full boreder-4 border-solid border-blue-600 border-t-transparent mb-4">
              <p className="text-gray-600 dark:text-gray-400">Verificando sesión...</p>
            </div>
          </div>
        </main>
      );
    }
    return null;
  };
}
