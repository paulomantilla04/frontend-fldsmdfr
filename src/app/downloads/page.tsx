import AppLayout from "../components/AppLayout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FLDSMDFR - Descargas",
  description: "Descargas",
}

export default function Dashboard() {
    return (
        <AppLayout>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Descargas
          </h1>
        </div>
      </AppLayout>
    )
}