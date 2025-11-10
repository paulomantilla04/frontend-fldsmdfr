"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, getUserFullName } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-xl text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldX className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>

        <p className="text-gray-600 mb-2">
          Hola <strong>{getUserFullName()}</strong>
        </p>

        <p className="text-gray-600 mb-6">
          Tu rol actual es:{" "}
          <span className="font-semibold text-red-600">
            {user?.role?.role || "Sin rol"}
          </span>
        </p>

        <p className="text-gray-700 mb-8">
          No tienes permisos para acceder a esta sección. Por favor, contacta
          a un administrador si crees que esto es un error.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition font-medium"
          >
            Volver Atrás
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
